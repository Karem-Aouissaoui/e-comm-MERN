import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO = Data Transfer Object
 *
 * This class defines:
 * - what the client is ALLOWED to send
 * - validation rules for each field
 *
 * NestJS automatically validates this because
 * we enabled ValidationPipe globally.
 */
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;

  /**
   * Password rules:
   * - minimum 8 characters
   * - max 72 because bcrypt ignores anything longer
   */
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
