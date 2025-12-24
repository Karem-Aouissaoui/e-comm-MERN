import {
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * ListProductsDto validates query parameters for GET /products
 * Example:
 * /products?search=dates&category=Food&page=1&limit=12&sort=latest
 */
export class ListProductsDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsIn(['latest', 'price_asc', 'price_desc'])
  sort?: 'latest' | 'price_asc' | 'price_desc';
}
