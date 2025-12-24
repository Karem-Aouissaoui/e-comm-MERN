import { IsEmail, IsString, MaxLength } from 'class-validator';

/**
 * LoginDto keeps login minimal: email + password.
 */
export class LoginDto {
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}
