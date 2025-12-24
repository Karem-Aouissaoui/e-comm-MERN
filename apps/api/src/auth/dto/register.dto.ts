import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * RegisterDto defines what a client is allowed to send when registering.
 * We include accountType because your HTML has buyer vs supplier dashboards.
 */
export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt input length best practice
  password!: string;

  /**
   * The UI implies two account types: buyer or supplier.
   * Admin is not self-registered.
   */
  @IsIn(['buyer', 'supplier'])
  accountType!: 'buyer' | 'supplier';

  // Optional profile data (comes from the profile pages in the HTML)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
