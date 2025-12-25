import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * MessageDocument is the MongoDB document type for individual messages.
 */
export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  /**
   * Each message belongs to a thread.
   */
  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true, index: true })
  threadId!: Types.ObjectId;

  /**
   * Sender is a user (buyer or supplier).
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId!: Types.ObjectId;

  /**
   * Plain text message body (MVP).
   * Later we can support attachments, images, etc.
   */
  @Prop({ required: true, trim: true, minlength: 1, maxlength: 5000 })
  body!: string;

  // Added automatically by timestamps: true
  createdAt!: Date;
  updatedAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
