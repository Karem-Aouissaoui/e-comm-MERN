import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

/**
 * We store JWT in an httpOnly cookie for security.
 * Passport-JWT expects a function to extract the token from the request.
 */
function cookieExtractor(req: Request): string | null {
  // If cookie-parser is enabled in main.ts, req.cookies will exist.
  return req?.cookies?.access_token ?? null;
}

export type JwtPayload = {
  sub: string; // user id
  roles: string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_secret_change_me',
    });
  }

  /**
   * validate() runs AFTER JWT signature & expiration are verified.
   * Whatever we return becomes req.user.
   */
  validate(payload: JwtPayload) {
    if (!payload?.sub) throw new UnauthorizedException('Invalid token.');
    return { userId: payload.sub, roles: payload.roles };
  }
}
