import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { UserRole } from '../../users/schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard checks if the current user has one of the required roles.
 *
 * Important:
 * - This guard does NOT authenticate the user.
 * - It assumes authentication already happened (JwtAuthGuard).
 *
 * Typical usage:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('supplier')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /**
     * Read roles metadata set by @Roles(...)
     * - getHandler() = method level (e.g., @Get)
     * - getClass()   = controller level (e.g., @Controller)
     *
     * getAllAndOverride means:
     * method roles override controller roles if both exist.
     */
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If route does not require roles, allow access (guard does nothing).
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Access the current request
    const req = context.switchToHttp().getRequest<Request>();

    // JwtStrategy.validate() returns an object that becomes req.user
    const user = (req as any).user as
      | { userId?: string; roles?: UserRole[] }
      | undefined;

    // If there is no user, it means authentication didn't run (or failed).
    // In real usage you should pair RolesGuard with JwtAuthGuard.
    if (!user || !user.roles) {
      throw new ForbiddenException('Missing user roles (are you logged in?)');
    }

    // Check if user has at least one required role
    const hasRole = requiredRoles.some((role) => user.roles!.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
