import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

/**
 * This controller exists ONLY to test auth + roles quickly.
 * We can delete it later.
 */
@Controller('demo')
export class AuthDemoController {
  /**
   * GET /demo/any-auth
   * Requires: logged in (any role)
   */
  @UseGuards(JwtAuthGuard)
  @Get('any-auth')
  anyAuth() {
    return { ok: true, message: 'You are authenticated.' };
  }

  /**
   * GET /demo/supplier-only
   * Requires:
   * - JWT cookie (JwtAuthGuard)
   * - role = supplier (RolesGuard + @Roles)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @Get('supplier-only')
  supplierOnly() {
    return { ok: true, message: 'You are a supplier.' };
  }

  /**
   * GET /demo/admin-only
   * Requires admin role
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  adminOnly() {
    return { ok: true, message: 'You are an admin.' };
  }
}
