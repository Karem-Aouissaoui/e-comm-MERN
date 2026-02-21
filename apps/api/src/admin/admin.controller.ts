import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { UsersService } from '../users/users.service';
import type { UserRole } from '../users/schemas/user.schema';

/**
 * AdminController — all endpoints require the 'admin' role.
 * No business logic here beyond data fetching and delegating to services.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  // ─── Users ────────────────────────────────────────────────────────────────

  /** GET /admin/users — list every user (no passwords) */
  @Get('users')
  listUsers() {
    return this.usersService.list();
  }

  /** PATCH /admin/users/:id/deactivate — soft-ban a user */
  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  /** PATCH /admin/users/:id/activate — re-enable a user */
  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  /** PATCH /admin/users/:id/roles — replace a user's roles array */
  @Patch('users/:id/roles')
  setRoles(@Param('id') id: string, @Body() body: { roles: UserRole[] }) {
    return this.usersService.setRoles(id, body.roles);
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  /** GET /admin/products — all products across all suppliers */
  @Get('products')
  async listProducts() {
    return this.productModel.find().sort({ createdAt: -1 }).lean();
  }

  /** DELETE /admin/products/:id — archive (soft-delete) any product */
  @Delete('products/:id')
  async archiveProduct(@Param('id') id: string) {
    const updated = await this.productModel.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Product not found.');
    return updated;
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  /** GET /admin/orders — all orders in the system */
  @Get('orders')
  async listOrders() {
    return this.orderModel.find().sort({ createdAt: -1 }).lean();
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  /** GET /admin/stats — aggregate counts for dashboard cards */
  @Get('stats')
  async getStats() {
    const [
      totalUsers,
      totalSuppliers,
      totalBuyers,
      totalProducts,
      publishedProducts,
      totalOrders,
      paidOrders,
    ] = await Promise.all([
      this.usersService.count(),
      this.usersService.countByRole('supplier'),
      this.usersService.countByRole('buyer'),
      this.productModel.countDocuments(),
      this.productModel.countDocuments({ status: 'published' }),
      this.orderModel.countDocuments(),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$totalCents' } } },
      ]),
    ]);

    return {
      totalUsers,
      totalSuppliers,
      totalBuyers,
      totalProducts,
      publishedProducts,
      archivedProducts: totalProducts - publishedProducts,
      totalOrders,
      totalRevenueCents: paidOrders[0]?.revenue ?? 0,
    };
  }
}
