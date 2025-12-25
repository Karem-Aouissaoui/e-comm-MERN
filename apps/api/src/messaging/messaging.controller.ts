import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateThreadDto } from './dto/create-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagingService } from './messaging.service';

/**
 * MessagingController exposes endpoints for threads and messages.
 * We only require authentication; participant checks happen in the service.
 */
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  /**
   * POST /messaging/threads
   * Buyer starts a conversation with a supplier about a product or order.
   *
   * NOTE:
   * In this MVP, we assume thread creation is buyer-initiated (matches many marketplaces).
   * If you want suppliers to start threads too, we can extend it easily.
   */
  @Post('threads')
  createThread(@Req() req: Request, @Body() dto: CreateThreadDto) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.messaging.createOrGetThread(user.userId, dto);
  }

  /**
   * GET /messaging/threads
   * Inbox list for current user.
   */
  @Get('threads')
  listThreads(@Req() req: Request) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.messaging.listMyThreads(user);
  }

  /**
   * GET /messaging/threads/:id
   * Get a single thread (participant/admin only).
   */
  @Get('threads/:id')
  getThread(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.messaging.getThread({
      threadId: id,
      userId: user.userId,
      roles: user.roles,
    });
  }

  /**
   * GET /messaging/threads/:id/messages
   * List messages of a thread.
   */
  @Get('threads/:id/messages')
  listMessages(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.messaging.listMessages({
      threadId: id,
      userId: user.userId,
      roles: user.roles,
    });
  }

  /**
   * POST /messaging/threads/:id/messages
   * Send a message in a thread.
   */
  @Post('threads/:id/messages')
  sendMessage(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    const user = (req as any).user as { userId: string; roles: string[] };
    return this.messaging.sendMessage({
      threadId: id,
      userId: user.userId,
      roles: user.roles,
      dto,
    });
  }
}
