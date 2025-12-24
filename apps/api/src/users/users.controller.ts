import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/**
 * Controller = HTTP interface
 * It should be THIN:
 * - receive request
 * - call service
 * - return response
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Temporary registration endpoint
   */
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   * GET /users
   */
  @Get()
  list() {
    return this.usersService.list();
  }

  /**
   * GET /users/:id
   */
  @Get(':id')
  find(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * PATCH /users/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  /**
   * PATCH /users/:id/deactivate
   */
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
