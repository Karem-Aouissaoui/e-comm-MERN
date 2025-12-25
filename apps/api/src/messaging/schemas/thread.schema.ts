import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * ThreadDocument is the MongoDB document type for a conversation thread.
 */
export type ThreadDocument = HydratedDocument<Thread>;

@Schema({ timestamps: true })
export class Thread {
  /**
   * Participants:
   * - buyerId: the buyer user id
   * - supplierId: the supplier user id
   *
   * We keep them explicit because your UI is buyer/supplier oriented.
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  supplierId!: Types.ObjectId;

  /**
   * Optional context links:
   * - productId if the chat is about a product
   * - orderId if the chat is about a specific order
   *
   * This matches common marketplace behavior.
   */
  @Prop({ type: Types.ObjectId, ref: 'Product', default: null, index: true })
  productId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null, index: true })
  orderId?: Types.ObjectId | null;

  /**
   * Preview fields for inbox performance:
   * - lastMessageText: show snippet in inbox list
   * - lastMessageAt: sort inbox by activity
   */
  @Prop({ trim: true, maxlength: 300, default: '' })
  lastMessageText!: string;

  @Prop({ type: Date, required: false })
  lastMessageAt?: Date;

  // Added automatically by timestamps: true
  createdAt!: Date;
  updatedAt!: Date;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);

/**
 * Ensure we don't create duplicate threads for the same buyer/supplier/product/order context.
 * This keeps inbox clean.
 */
ThreadSchema.index(
  { buyerId: 1, supplierId: 1, productId: 1, orderId: 1 },
  { unique: true, partialFilterExpression: { buyerId: { $type: 'objectId' } } },
);
