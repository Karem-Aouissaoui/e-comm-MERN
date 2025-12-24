import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * AuthService contains authentication business logic:
 * - Register
 * - Login
 * - Create JWT
 *
 * It does NOT directly deal with HTTP cookies; the controller does that.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Create a signed JWT access token.
   * Payload uses "sub" standard claim for subject (user id).
   */
  private createAccessToken(userId: string, roles: string[]) {
    return this.jwt.sign(
      { sub: userId, roles },
      { expiresIn: '7d' }, // simple MVP; later we can do refresh tokens
    );
  }

  /**
   * Register a buyer or supplier.
   * We set role and profile based on accountType from HTML flows.
   */
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use.');

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Build profile based on account type
    const isSupplier = dto.accountType === 'supplier';

    // IMPORTANT: We bypass UsersService.create() because that one expects plain password.
    // Here we store passwordHash directly.
    const created = await this.usersService.createWithPasswordHash({
      name: dto.name,
      email: dto.email,
      passwordHash,
      roles: [dto.accountType],
      buyerProfile: isSupplier
        ? null
        : {
            companyName: dto.companyName,
            country: dto.country,
            phone: dto.phone,
          },
      supplierProfile: isSupplier
        ? {
            companyName: dto.companyName,
            country: dto.country,
            city: dto.city,
            phone: dto.phone,
            website: dto.website,
            isVerified: false,
          }
        : null,
    });

    // Return both safe user data + token (controller will set cookie)
    const token = this.createAccessToken(created._id.toString(), created.roles);
    return {
      user: {
        id: created._id.toString(),
        email: created.email,
        name: created.name,
        roles: created.roles,
      },
      token,
    };
  }

  /**
   * Login by email + password.
   * Compare password with stored bcrypt hash.
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    if (!user.isActive) throw new UnauthorizedException('Account is inactive.');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials.');

    const token = this.createAccessToken(user._id.toString(), user.roles);
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
      token,
    };
  }
}
