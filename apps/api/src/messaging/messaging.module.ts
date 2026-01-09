import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Thread, ThreadSchema } from './schemas/thread.schema';
import { Order, OrderSchema } from 'src/orders/schemas/order.schema';

/**
 * MessagingModule registers:
 * - Thread model
 * - Message model
 * - Messaging service + controller
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
