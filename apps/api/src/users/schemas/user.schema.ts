import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'buyer' | 'supplier' | 'admin';

export class BuyerProfile {
  @Prop({ trim: true, maxlength: 120 })
  companyName?: string;

  @Prop({ trim: true, maxlength: 80 })
  country?: string;

  @Prop({ trim: true, maxlength: 40 })
  phone?: string;
}

export class SupplierProfile {
  @Prop({ trim: true, maxlength: 120 })
  companyName?: string;

  @Prop({ trim: true, maxlength: 80 })
  country?: string;

  @Prop({ trim: true, maxlength: 80 })
  city?: string;

  @Prop({ trim: true, maxlength: 40 })
  phone?: string;

  @Prop({ trim: true, maxlength: 200 })
  website?: string;

  @Prop({ default: false })
  isVerified?: boolean;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 60 })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 120,
  })
  email!: string;

  // Store bcrypt hash, never plain text
  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: [String], default: ['buyer'] })
  roles!: UserRole[];

  @Prop({ type: BuyerProfile, default: null })
  buyerProfile?: BuyerProfile | null;

  @Prop({ type: SupplierProfile, default: null })
  supplierProfile?: SupplierProfile | null;

  @Prop({ default: true })
  isActive!: boolean;

  // Added automatically by Mongoose because of { timestamps: true }
  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
