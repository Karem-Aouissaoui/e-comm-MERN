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
}

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
   * Optional expected delivery date (your UI shows delivery date).
   */
  @Prop({ default: null })
  expectedDeliveryDate?: Date | null;

  /**
   * Order total in cents
   */
  @Prop({ required: true, min: 0 })
  totalCents!: number;

  @Prop({ required: true, uppercase: true, maxlength: 3, default: 'EUR' })
  currency!: string;

  // Added automatically by timestamps: true
  createdAt!: Date;
  updatedAt!: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
