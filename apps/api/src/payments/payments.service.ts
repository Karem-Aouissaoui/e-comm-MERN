import {
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
     * 1) Reuse existing PaymentIntent if possible
     */
    if (order.stripePaymentIntentId) {
      const existing = await this.stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
      );

      if (existing && existing.client_secret) {
        return {
          orderId: order._id.toString(),
          paymentIntentId: existing.id,
          clientSecret: existing.client_secret,
        };
      }
    }

    /**
     * 2) Create a new PaymentIntent
     * At this point, intent WILL be created or the function throws.
     */
    let intent: Stripe.PaymentIntent;

    try {
      intent = await this.stripe.paymentIntents.create({
        amount: order.totalCents,
        currency: order.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order._id.toString(),
          buyerId: order.buyerId.toString(),
          supplierId: order.supplierId.toString(),
        },
      });
    } catch (err: any) {
      console.error(
        'Stripe PaymentIntent creation failed:',
        err?.type ?? err?.message,
      );
      throw new ForbiddenException('Payment provider configuration error.');
    }

    /**
     * 3) Persist Stripe info
     */
    order.stripePaymentIntentId = intent.id;
    order.paymentStatus = 'requires_action';
    await order.save();

    /**
     * 4) Return frontend-safe response
     */
    return {
      orderId: order._id.toString(),
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret!,
    };
  }
}
