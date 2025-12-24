import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

/**
 * OrdersController exposes HTTP endpoints.
 * Business logic stays in OrdersService.
 */
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  /**
   * POST /orders
   * Buyer-only: place an order.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  @Post()
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.orders.createOrder(user.userId, dto);
  }

  /**
   * GET /orders/buyer
   * Buyer-only: list my orders.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  @Get('buyer')
  listBuyer(@Req() req: Request) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.orders.listBuyerOrders(user.userId);
  }

  /**
   * GET /orders/supplier
   * Supplier-only: list orders assigned to me.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @Get('supplier')
  listSupplier(@Req() req: Request) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.orders.listSupplierOrders(user.userId);
  }

  /**
   * GET /orders/:id
   * Buyer or Supplier (or Admin) can access if they are part of the order.
   * We only require authentication; the service enforces ownership.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.orders.getOrderById({
      orderId: id,
      requesterId: user.userId,
      requesterRoles: user.roles,
    });
  }

  /**
   * PATCH /orders/:id/status
   * Supplier or Admin: update status (confirmed/shipped/cancelled).
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.orders.updateStatus({
      orderId: id,
      requesterId: user.userId,
      requesterRoles: user.roles,
      dto,
    });
  }
}
