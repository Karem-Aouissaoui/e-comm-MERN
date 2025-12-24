import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Buyer places an order for a product.
 * For MVP: one product per order (matches your HTML "place order").
 */
export class CreateOrderDto {
  @IsMongoId()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /**
   * Optional ISO date string for expected delivery.
   * Example: "2026-01-05"
   */
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}
