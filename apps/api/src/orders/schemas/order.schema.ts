import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * OrderDocument = MongoDB document type for orders.
 */
export type OrderDocument = HydratedDocument<Order>;

/**
 * OrderStatus matches your UI (Confirmed, Shipped).
 * We add pending/cancelled for a realistic flow.
 */
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'cancelled';

/**
 * OrderStatusEvent records each status change with a timestamp.
 * This creates a clear timeline for buyer/supplier/admin.
 */
@Schema({ _id: false })
export class OrderStatusEvent {
  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'shipped', 'cancelled'],
  })
  status!: 'pending' | 'confirmed' | 'shipped' | 'cancelled';

  @Prop({ type: Date, required: true })
  at!: Date;

  /**
   * Optional note (useful for cancellation reasons or internal remarks)
   */
  @Prop({ type: String, trim: true, maxlength: 500, required: false })
  note?: string;
}

export const OrderStatusEventSchema =
  SchemaFactory.createForClass(OrderStatusEvent);

@Schema({ timestamps: true })
export class Order {
  /**
   * Who placed the order (buyer user id)
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId!: Types.ObjectId;

  /**
   * Supplier that will fulfill the order.
   * For MVP we assume 1 supplier per order (matches your HTML).
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  supplierId!: Types.ObjectId;

  /**
   * Embedded items (MVP uses 1 item, but we support multiple for future).
   */
  @Prop({ type: [Object], required: true, default: [] })
  items!: OrderItem[];

  /**
   * Status shown in your dashboard pages.
   */
  @Prop({ required: true, default: 'pending' })
  status!: OrderStatus;

  /**
   * Optional notes from buyer (place-order.html implies this).
   */
  @Prop({ trim: true, maxlength: 2000, default: '' })
  notes!: string;

  /**
   * Optional expected delivery date.
   * We set type: Date because NestJS cannot infer union types (Date | null).
   */
  @Prop({ type: Date, required: false })
  expectedDeliveryDate?: Date;

  /**
   * Order total in cents
   */
  @Prop({ required: true, min: 0 })
  totalCents!: number;

  @Prop({ required: true, uppercase: true, maxlength: 3, default: 'EUR' })
  currency!: string;

  /**
   * Payment status of the order.
   * This is controlled ONLY by the backend (never by frontend).
   */
  @Prop({
    type: String,
    required: true,
    enum: ['unpaid', 'requires_action', 'paid', 'failed', 'refunded'],
    default: 'unpaid',
  })
  paymentStatus!: 'unpaid' | 'requires_action' | 'paid' | 'failed' | 'refunded';

  /**
   * Stripe PaymentIntent ID.
   * Stored so webhooks can match Stripe events to our order.
   */
  @Prop({ type: String, required: false })
  stripePaymentIntentId?: string;

  /**
   * When payment was completed successfully.
   */
  @Prop({ type: Date, required: false })
  paidAt?: Date;

  // Added automatically by timestamps: true
  createdAt!: Date;
  updatedAt!: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

/**
 * OrderItem is embedded inside an Order.
 * We snapshot title/unitPrice so the order remains correct even if product changes later.
 */
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  /**
   * Unit price in cents (snapshot from product at order time)
   */
  @Prop({ required: true, min: 0 })
  unitPriceCents!: number;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  /**
   * Status history timeline.
   * We store it explicitly so we can display “what happened when”.
   */
  @Prop({ type: [OrderStatusEventSchema], required: true, default: [] })
  statusHistory!: OrderStatusEvent[];
}
