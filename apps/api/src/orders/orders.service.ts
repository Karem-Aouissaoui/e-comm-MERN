import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderDocument } from './schemas/order.schema';

/**
 * OrdersService contains business logic for:
 * - creating orders (buyer)
 * - listing orders for buyer/supplier
 * - enforcing access control (ownership)
 * - updating status (supplier/admin)
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    /**
     * We depend on ProductsService to:
     * - validate product exists and is published
     * - read supplierId and price for totals
     */
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Buyer places an order for a published product.
   */
  async createOrder(buyerId: string, dto: CreateOrderDto) {
    // 1) Load the published product to validate + get price/supplier
    const product = await this.productsService.findPublicById(dto.productId);

    // 2) Calculate total
    const totalCents = product.priceCents * dto.quantity;

    // 3) Create order (1 supplier per order in this MVP)
    const created = await this.orderModel.create({
      buyerId: new Types.ObjectId(buyerId),
      supplierId: product.supplierId, // already an ObjectId
      items: [
        {
          productId: product._id,
          title: product.title,
          unitPriceCents: product.priceCents,
          quantity: dto.quantity,
        },
      ],
      status: 'pending',
      notes: dto.notes ?? '',
      expectedDeliveryDate: dto.expectedDeliveryDate
        ? new Date(dto.expectedDeliveryDate)
        : null,
      totalCents,
      currency: product.currency ?? 'EUR',
    });

    return created;
  }

  /**
   * Buyer: list my orders.
   */
  async listBuyerOrders(buyerId: string) {
    return this.orderModel
      .find({ buyerId: new Types.ObjectId(buyerId) })
      .sort({ createdAt: -1 });
  }

  /**
   * Supplier: list orders where I am the supplier.
   */
  async listSupplierOrders(supplierId: string) {
    return this.orderModel
      .find({ supplierId: new Types.ObjectId(supplierId) })
      .sort({ createdAt: -1 });
  }

  /**
   * Get order by id with access control:
   * - buyer can view their own order
   * - supplier can view orders assigned to them
   * - admin can view everything (future-proofed)
   */
  async getOrderById(params: {
    orderId: string;
    requesterId: string;
    requesterRoles: string[];
  }) {
    const order = await this.orderModel.findById(params.orderId);
    if (!order) throw new NotFoundException('Order not found.');

    const isAdmin = params.requesterRoles.includes('admin');
    const isBuyer = order.buyerId.toString() === params.requesterId;
    const isSupplier = order.supplierId.toString() === params.requesterId;

    if (!isAdmin && !isBuyer && !isSupplier) {
      throw new ForbiddenException('You do not have access to this order.');
    }

    return order;
  }

  /**
   * Supplier (or admin): update order status.
   * Buyer cannot change status in this MVP.
   */
  async updateStatus(params: {
    orderId: string;
    requesterId: string;
    requesterRoles: string[];
    dto: UpdateOrderStatusDto;
  }) {
    const order = await this.orderModel.findById(params.orderId);
    if (!order) throw new NotFoundException('Order not found.');

    const isAdmin = params.requesterRoles.includes('admin');
    const isSupplier = order.supplierId.toString() === params.requesterId;

    if (!isAdmin && !isSupplier) {
      throw new ForbiddenException(
        'Only the supplier or admin can update status.',
      );
    }

    order.status = params.dto.status;
    await order.save();
    return order;
  }
}
