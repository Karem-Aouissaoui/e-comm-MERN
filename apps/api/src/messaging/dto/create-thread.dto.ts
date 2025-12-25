import { IsMongoId, IsOptional } from 'class-validator';

/**
 * CreateThreadDto:
 * You can open a thread with a supplier, optionally tied to a product or an order.
 */
export class CreateThreadDto {
  @IsMongoId()
  supplierId!: string;

  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsOptional()
  @IsMongoId()
  orderId?: string;
}
