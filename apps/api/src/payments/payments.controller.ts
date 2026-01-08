import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateIntentDto } from './dto/create-intent.dto';
import { PaymentsService } from './payments.service';

/**
 * IMPORTANT:
 * - /payments/intent is protected (JWT)
 * - /payments/webhook is public (Stripe calls it)
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('intent')
  createIntent(@Req() req: Request, @Body() dto: CreateIntentDto) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.payments.createPaymentIntent(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:orderId')
  getPaymentStatus(@Req() req: Request, @Param('orderId') orderId: string) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.payments.getPaymentStatus(user, orderId);
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('[WEBHOOK] HIT /payments/webhook');
    if (!req.rawBody) {
      console.log('[WEBHOOK] Missing rawBody');
      throw new BadRequestException(
        'Missing raw body for webhook verification.',
      );
    }

    return this.payments.handleStripeWebhook({
      rawBody: req.rawBody,
      signature,
    });
  }
}
