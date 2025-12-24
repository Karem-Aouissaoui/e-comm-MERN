import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * ProductDocument = a Product stored in MongoDB with Mongoose document helpers.
 */
export type ProductDocument = HydratedDocument<Product>;

/**
 * ProductStatus helps with moderation:
 * - draft: supplier is still working on it
 * - published: visible to buyers
 * - archived: hidden, but kept for history
 */
export type ProductStatus = 'draft' | 'published' | 'archived';

@Schema({ timestamps: true })
export class Product {
  /**
   * Link product to the supplier who owns it.
   * We store ObjectId referencing the User collection.
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  supplierId!: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 120 })
  title!: string;

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 5000 })
  description!: string;

  /**
   * Price stored in minor units (cents).
   * Example: €12.99 → 1299
   */
  @Prop({ required: true, min: 0 })
  priceCents!: number;

  /**
   * Your HTML shows EUR, but keep currency flexible.
   */
  @Prop({ required: true, default: 'EUR', uppercase: true, maxlength: 3 })
  currency!: string;

  @Prop({ required: true, trim: true, maxlength: 60, index: true })
  category!: string;

  /**
   * MOQ = minimum order quantity (common B2B requirement).
   */
  @Prop({ required: true, min: 1, default: 1 })
  minOrderQty!: number;

  /**
   * For MVP, keep an array of image URLs.
   * Later we can implement upload to Cloudinary/S3.
   */
  @Prop({ type: [String], default: [] })
  imageUrls!: string[];

  @Prop({ required: true, default: 'published' })
  status!: ProductStatus;

  // Added automatically by timestamps: true
  createdAt!: Date;
  updatedAt!: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

/**
 * Helpful index for search:
 * text index allows keyword searching in title/description.
 */
ProductSchema.index({ title: 'text', description: 'text' });
