import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessagingService } from '../messaging/messaging.service';
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
 * - creating a thread for the messaging system
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
    private readonly messagingService: MessagingService,
  ) {}

  /**
   * Create an order, then auto-create/reuse a messaging thread linked to it.
   * Using `new this.orderModel()` + `.save()` keeps TypeScript types stable.
   */
  async createOrder(buyerId: string, dto: CreateOrderDto) {
    const product = await this.productsService.findPublicById(dto.productId);

    const totalCents = product.priceCents * dto.quantity;

    const expectedDeliveryDate = dto.expectedDeliveryDate
      ? new Date(dto.expectedDeliveryDate)
      : undefined;

    const now = new Date();

    // ✅ Use `new Model()` instead of `Model.create()` to avoid "never" inference issues.
    const order = new this.orderModel({
      buyerId: new Types.ObjectId(buyerId),
      supplierId: product.supplierId,
      items: [
        {
          productId: product._id,
          title: product.title,
          unitPriceCents: product.priceCents,
          quantity: dto.quantity,
        },
      ],
      status: 'pending',
      statusHistory: [{ status: 'pending', at: now, note: 'Order created' }],
      paymentStatus: 'unpaid', // 🔒 critical
      notes: dto.notes ?? '',
      expectedDeliveryDate,
      totalCents,
      currency: product.currency ?? 'EUR',
    });

    // Save to DB (now we definitely have _id and correct typing)
    const saved = await order.save();

    /**
     * Auto-create (or reuse) a thread linked to this order so buyer/supplier can chat about it.
     */
    await this.messagingService.createOrGetThread(buyerId, {
      supplierId: saved.supplierId.toString(),
      orderId: saved._id.toString(),
    });

    return saved;
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

    /**
     * Business rule:
     * Supplier cannot confirm or ship an unpaid order.
     */
    if (
      ['confirmed', 'shipped'].includes(params.dto.status) &&
      order.paymentStatus !== 'paid'
    ) {
      throw new ForbiddenException('Order must be paid before fulfillment.');
    }

    order.status = params.dto.status;
    await order.save();
    return order;
  }

  /**
   * Supplier inbox (Policy A):
   * Only orders that are paid and still pending confirmation.
   */
  async listSupplierInbox(supplierId: string) {
    return this.orderModel
      .find({
        supplierId: new Types.ObjectId(supplierId),
        status: 'pending',
        paymentStatus: 'paid',
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Get or create the messaging thread linked to an order.
   * We enforce access using getOrderById first.
   */
  async getOrCreateOrderThread(params: {
    orderId: string;
    requesterId: string;
    requesterRoles: string[];
  }) {
    const order = await this.getOrderById({
      orderId: params.orderId,
      requesterId: params.requesterId,
      requesterRoles: params.requesterRoles,
    });

    // Thread is anchored on buyer, because createOrGetThread expects buyerId.
    const thread = await this.messagingService.createOrGetThread(
      order.buyerId.toString(),
      {
        supplierId: order.supplierId.toString(),
        orderId: order._id.toString(),
      },
    );

    return thread;
  }
}
