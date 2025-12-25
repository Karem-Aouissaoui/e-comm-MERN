import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateThreadDto } from './dto/create-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Message, MessageDocument } from './schemas/message.schema';
import { Thread, ThreadDocument } from './schemas/thread.schema';

/**
 * MessagingService handles thread + message operations.
 *
 * IMPORTANT:
 * We enforce access control here (not only in controller),
 * because services can be reused by other modules in the future.
 */
@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Thread.name)
    private readonly threadModel: Model<ThreadDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Create (or return existing) thread between buyer and supplier.
   *
   * We use buyerId from JWT (req.user.userId) and supplierId from DTO.
   */
  async createOrGetThread(buyerId: string, dto: CreateThreadDto) {
    const query = {
      buyerId: new Types.ObjectId(buyerId),
      supplierId: new Types.ObjectId(dto.supplierId),
      productId: dto.productId ? new Types.ObjectId(dto.productId) : null,
      orderId: dto.orderId ? new Types.ObjectId(dto.orderId) : null,
    };

    // Find existing thread first (prevents duplicates)
    const existing = await this.threadModel.findOne(query);
    if (existing) return existing;

    // Create new thread
    return this.threadModel.create({
      ...query,
      // Empty snippet when there are no messages yet
      lastMessageText: '',
      // Leave undefined => field not stored until first message
      lastMessageAt: undefined,
    });
  }

  /**
   * List threads for current user (buyer or supplier).
   * This powers the inbox pages in your HTML.
   */
  async listMyThreads(params: { userId: string; roles: string[] }) {
    const userObjectId = new Types.ObjectId(params.userId);

    // Buyer sees threads where they are buyerId; supplier sees threads where they are supplierId.
    const isSupplier = params.roles.includes('supplier');
    const filter = isSupplier
      ? { supplierId: userObjectId }
      : { buyerId: userObjectId };

    return this.threadModel
      .find(filter)
      .sort({ lastMessageAt: -1, updatedAt: -1 });
  }

  /**
   * Get thread by id if the user is a participant (or admin).
   */
  async getThread(params: {
    threadId: string;
    userId: string;
    roles: string[];
  }) {
    const thread = await this.threadModel.findById(params.threadId);
    if (!thread) throw new NotFoundException('Thread not found.');

    const isAdmin = params.roles.includes('admin');
    const isBuyer = thread.buyerId.toString() === params.userId;
    const isSupplier = thread.supplierId.toString() === params.userId;

    if (!isAdmin && !isBuyer && !isSupplier) {
      throw new ForbiddenException('You do not have access to this thread.');
    }

    return thread;
  }

  /**
   * List messages in a thread (only participants/admin).
   */
  async listMessages(params: {
    threadId: string;
    userId: string;
    roles: string[];
  }) {
    // Ensure access
    await this.getThread(params);

    return this.messageModel
      .find({ threadId: new Types.ObjectId(params.threadId) })
      .sort({ createdAt: 1 }); // oldest first (chat style)
  }

  /**
   * Send a message in a thread.
   */
  async sendMessage(params: {
    threadId: string;
    userId: string;
    roles: string[];
    dto: SendMessageDto;
  }) {
    const thread = await this.getThread({
      threadId: params.threadId,
      userId: params.userId,
      roles: params.roles,
    });

    const created = await this.messageModel.create({
      threadId: new Types.ObjectId(params.threadId),
      senderId: new Types.ObjectId(params.userId),
      body: params.dto.body.trim(),
    });

    /**
     * Update thread preview fields so inbox can show:
     * - last message snippet
     * - last activity time
     */
    thread.lastMessageText = created.body.slice(0, 300);
    thread.lastMessageAt = created.createdAt ?? new Date();
    await thread.save();

    return created;
  }
}
