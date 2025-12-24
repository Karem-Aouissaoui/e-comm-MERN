import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../users/schemas/user.schema';

/**
 * Metadata key used by the RolesGuard.
 * We attach required roles to a route handler using this key.
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles('admin') on a controller method means:
 * "Only allow requests where req.user.roles includes 'admin'"
 *
 * The JwtStrategy puts roles into req.user, so the guard can check them.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
