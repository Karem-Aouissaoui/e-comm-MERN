import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';

import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateIntentDto } from './dto/create-intent.dto';

/**
 * PaymentsService:
 * - Creates Stripe PaymentIntents
 * - Persists Stripe IDs to the Order
 *
 * IMPORTANT RULE:
 * - Amount is always read from DB (order.totalCents).
 * - Never trust amount from client.
 */
@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    /**
     * Stripe SDK client.
     * Uses your secret key from environment variables.
     */
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY in environment.');
    }

    this.stripe = new Stripe(secretKey, {
      // Stripe recommends specifying an API version for stability.
      // If you want, we can lock to the exact version shown in your Stripe dashboard later.
    });
  }

  /**
   * Create (or reuse) a PaymentIntent for the order.
   * Only the buyer who owns the order can do this.
   */

  async createPaymentIntent(
    requester: { userId: string; roles: string[] },
    dto: CreateIntentDto,
  ) {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) throw new NotFoundException('Order not found.');

    if (!requester.roles.includes('buyer')) {
      throw new ForbiddenException('Only buyers can create payment intents.');
    }

    if (order.buyerId.toString() !== requester.userId) {
      throw new ForbiddenException('You do not own this order.');
    }

    if (order.paymentStatus === 'paid') {
      throw new ForbiddenException('Order already paid.');
    }

    /**
     * Idempotency:
     * If this order already has a PaymentIntent, reuse it.
     * This prevents multiple intents for the same order when users refresh.
     */
    if (order.stripePaymentIntentId) {
      const existing = await this.stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
      );

      // If Stripe still has a usable client_secret, return it
      if (existing?.client_secret && existing.status !== 'canceled') {
        console.log(
          '[INTENT][REUSE]',
          'order',
          order._id.toString(),
          'pi',
          existing.id,
          'status',
          existing.status,
        );
        if (existing.status === 'succeeded') {
          // Webhook may have been missed locally, so sync DB to reality.
          order.paymentStatus = 'paid';
          order.paidAt = order.paidAt ?? new Date();
          await order.save();
        }

        return {
          orderId: order._id.toString(),
          paymentIntentId: existing.id,
          clientSecret: existing.client_secret,
        };
      }
    }

    // Otherwise create a new one
    const intent = await this.stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: order.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: order._id.toString(),
        buyerId: order.buyerId.toString(),
        supplierId: order.supplierId.toString(),
      },
    });

    console.log(
      '[INTENT][NEW]',
      'order',
      order._id.toString(),
      'pi',
      intent.id,
      'meta.orderId',
      intent.metadata?.orderId,
    );

    order.stripePaymentIntentId = intent.id;
    order.paymentStatus = 'requires_action';
    await order.save();

    return {
      orderId: order._id.toString(),
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }

  /**
   * Buyer can check payment status for their own order.
   * Useful for frontend polling while waiting for webhook updates.
   */
  async getPaymentStatus(
    requester: { userId: string; roles: string[] },
    orderId: string,
  ) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found.');

    // Buyer-only for MVP (easy rule)
    if (!requester.roles.includes('buyer')) {
      throw new ForbiddenException('Only buyers can view payment status.');
    }

    if (order.buyerId.toString() !== requester.userId) {
      throw new ForbiddenException('You do not own this order.');
    }

    return {
      orderId: order._id.toString(),
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt ?? null,
    };
  }
  /**
   * Handle Stripe webhook events.
   * IMPORTANT:
   * - We must verify the signature using the raw body and STRIPE_WEBHOOK_SECRET.
   * - We never trust client-side "payment succeeded" claims.
   */
  async handleStripeWebhook(params: { rawBody: Buffer; signature: string }) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET in environment.');
    }

    let event: Stripe.Event;

    try {
      // Verify signature and construct the event
      event = this.stripe.webhooks.constructEvent(
        params.rawBody,
        params.signature,
        webhookSecret,
      );
    } catch (err: any) {
      // Stripe recommends returning 400 on signature verification failure
      throw new BadRequestException('Webhook signature verification failed.');
    }

    /**
     * Stripe confirms success/failure via these events.
     */
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.log(
          '[WEBHOOK] succeeded intent:',
          intent.id,
          'meta.orderId:',
          intent.metadata?.orderId,
        );
        /**
         * Primary mapping: we store stripePaymentIntentId on the order
         */
        let order = await this.orderModel.findOne({
          stripePaymentIntentId: intent.id,
        });

        /**
         * Fallback mapping: if metadata.orderId exists, use it.
         * This makes debugging and recovery easier.
         */
        if (!order && intent.metadata?.orderId) {
          order = await this.orderModel.findById(intent.metadata.orderId);
        }
        console.log(
          '[WEBHOOK] matched order:',
          order?._id?.toString() ?? 'NONE',
        );
        // If we still can't find the order, we acknowledge the webhook and move on.
        if (!order) return { received: true };

        // Idempotency: do nothing if already paid
        if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.paidAt = new Date();

          /**
           * Policy A:
           * Do NOT auto-confirm the business order status.
           * Supplier must still confirm availability/fulfillment.
           */
          await order.save();
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;

        let order = await this.orderModel.findOne({
          stripePaymentIntentId: intent.id,
        });

        if (!order && intent.metadata?.orderId) {
          order = await this.orderModel.findById(intent.metadata.orderId);
        }

        if (!order) return { received: true };

        // Only mark failed if it was not already paid
        if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'failed';
          await order.save();
        }

        break;
      }

      default:
        // For MVP: ignore unhandled events
        break;
    }

    // Stripe expects a 2xx response when webhook is received successfully
    return { received: true };
  }
}
