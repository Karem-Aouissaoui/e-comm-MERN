import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

/**
 * ProductsService contains all product business logic.
 * Controllers should stay thin and call these methods.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  /**
   * Create product owned by the logged-in supplier.
   */
  async create(supplierId: string, dto: CreateProductDto) {
    const created = await this.productModel.create({
      supplierId: new Types.ObjectId(supplierId),
      title: dto.title.trim(),
      description: dto.description.trim(),
      priceCents: dto.priceCents,
      currency: (dto.currency ?? 'EUR').toUpperCase(),
      category: dto.category.trim(),
      minOrderQty: dto.minOrderQty,
      imageUrls: dto.imageUrls ?? [],
      status: 'published',
    });

    return created;
  }

  /**
   * Public browsing with pagination, search, filtering and sorting.
   */
  async list(dto: ListProductsDto) {
    const page = Math.max(parseInt(dto.page ?? '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(dto.limit ?? '12', 10), 1), 50);

    const filter: QueryFilter<ProductDocument> = { status: 'published' };

    // Category filter (exact match for MVP)
    if (dto.category) filter.category = dto.category;

    // Search (text index)
    if (dto.search) filter.$text = { $search: dto.search };

    let sort: any = { createdAt: -1 };
    if (dto.sort === 'price_asc') sort = { price: 1 };
    if (dto.sort === 'price_desc') sort = { price: -1 };

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Public product detail.
   */
  async findPublicById(id: string) {
    const product = await this.productModel.findOne({
      _id: id,
      status: 'published',
    });
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  /**
   * Supplier can see their own products (including draft/archived).
   */
  async listMine(supplierId: string) {
    return this.productModel
      .find({ supplierId: new Types.ObjectId(supplierId) })
      .sort({ createdAt: -1 });
  }

  /**
   * Update product; only owner supplier may update.
   */
  async updateMine(
    supplierId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found.');

    // Ownership check
    if (product.supplierId.toString() !== supplierId) {
      throw new ForbiddenException('You do not own this product.');
    }

    // Apply updates safely
    if (dto.title !== undefined) product.title = dto.title.trim();
    if (dto.description !== undefined)
      product.description = dto.description.trim();
    if (dto.priceCents !== undefined) product.priceCents = dto.priceCents;
    if (dto.currency !== undefined)
      product.currency = dto.currency.toUpperCase();
    if (dto.category !== undefined) product.category = dto.category.trim();
    if (dto.minOrderQty !== undefined) product.minOrderQty = dto.minOrderQty;
    if (dto.imageUrls !== undefined) product.imageUrls = dto.imageUrls;
    if (dto.status !== undefined) product.status = dto.status;

    await product.save();
    return product;
  }

  /**
   * "Delete" in MVP becomes archive (safer than hard delete).
   */
  async archiveMine(supplierId: string, productId: string) {
    return this.updateMine(supplierId, productId, { status: 'archived' });
  }
}
