import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';

/**
 * ProductsModule wires together:
 * - the Product mongoose schema (Model injection)
 * - the service (business logic)
 * - the controller (HTTP endpoints)
 */
@Module({
  imports: [
    /**
     * forFeature() registers the Product model provider inside this module.
     * Without this, @InjectModel(Product.name) will fail with "ProductModel" missing.
     */
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  /**
   * Export ProductsService so other modules (Orders) can reuse it.
   * This is NestJS dependency injection best practice.
   */
  exports: [ProductsService],
})
export class ProductsModule {}
