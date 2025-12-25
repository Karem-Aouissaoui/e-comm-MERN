import {
  BadRequestException,
  Headers,
  HttpCode,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateIntentDto } from './dto/create-intent.dto';
import { PaymentsService } from './payments.service';

/**
 * PaymentsController:
 * - Buyer creates a PaymentIntent for an order
 * - Returns clientSecret for Stripe.js on frontend
 */
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /**
   * POST /payments/intent
   * Body: { orderId }
   *
   * Returns: { clientSecret, paymentIntentId }
   */
  @Post('intent')
  createIntent(@Req() req: Request, @Body() dto: CreateIntentDto) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.payments.createPaymentIntent(user, dto);
  }

  /**
   * POST /payments/webhook
   * Stripe webhook endpoint.
   *
   * IMPORTANT:
   * - No auth guard here (Stripe servers call it).
   * - Must use req.rawBody to verify signatures.
   */
  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    /**
     * rawBody must exist for Stripe signature verification.
     * If it's missing, our Nest rawBody config is not applied correctly.
     */
    if (!req.rawBody) {
      throw new BadRequestException(
        'Missing raw body for webhook verification.',
      );
    }

    return this.payments.handleStripeWebhook({
      rawBody: req.rawBody, // now guaranteed Buffer
      signature,
    });
  }
}
