import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

/**
 * Module = feature boundary
 * It groups:
 * - controller
 * - service
 * - database model
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],

  /**
   * Export service so AuthModule can use it
   */
  exports: [UsersService],
})
export class UsersModule {}
