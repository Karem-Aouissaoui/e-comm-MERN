import { IsMongoId } from 'class-validator';

/**
 * Buyer requests a payment intent for a specific order.
 * We do not accept amount from frontend — we use the server-side order total.
 */
export class CreateIntentDto {
  @IsMongoId()
  orderId!: string;
}
