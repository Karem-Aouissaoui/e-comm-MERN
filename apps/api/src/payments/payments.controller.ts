import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

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
}
