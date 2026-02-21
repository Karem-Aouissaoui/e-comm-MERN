import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

/**
 * ProductsController defines HTTP routes for products.
 * Some routes are public (browse), others require supplier auth.
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  /**
   * GET /products/:id/thread
   * Buyer-only: pre-purchase questions to supplier
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/thread')
  async getOrCreateProductThread(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user as { userId: string; roles: string[] };

    const thread = await this.products.getOrCreateProductThread({
      productId: id,
      requesterId: user.userId,
      requesterRoles: user.roles,
    });
    // Always return a small, stable response shape for frontend
    return { threadId: thread._id.toString() };
  }

  /**
   * GET /products
   * Public browsing endpoint for buyers (and anyone).
   */
  @Get()
  list(@Query() query: ListProductsDto) {
    return this.products.list(query);
  }

  /**
   * GET /products/mine
   * Supplier-only: list own products.
   *
   * IMPORTANT: Must be declared BEFORE :id to avoid NestJS matching 'mine' as an ObjectId.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @Get('mine')
  listMine(@Req() req: Request) {
    const userId = (req as any).user.userId as string;
    return this.products.listMine(userId);
  }

  /**
   * GET /products/:id
   * Public product detail.
   */
  @Get(':id')
  find(@Param('id') id: string) {
    return this.products.findPublicById(id);
  }

  /**
   * POST /products
   * Supplier-only: create product.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @Post()
  create(@Req() req: Request, @Body() dto: CreateProductDto) {
    const userId = (req as any).user.userId as string;
    return this.products.create(userId, dto);
  }

  /**
   * PATCH /products/:id
   * Supplier-only: update owned product.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @Patch(':id')
  updateMine(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const userId = (req as any).user.userId as string;
    return this.products.updateMine(userId, id, dto);
  }

  /**
   * DELETE /products/:id
   * Supplier-only: archive product instead of hard delete.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @Delete(':id')
  archiveMine(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.userId as string;
    return this.products.archiveMine(userId, id);
  }
}
