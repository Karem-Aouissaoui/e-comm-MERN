import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';
import { UsersService } from './users/users.service';
import { CreateProductDto } from './products/dto/create-product.dto';
import * as mongoose from 'mongoose';

async function bootstrap() {
  // Boot Nest application context to reuse services (including Config/Mongoose)
  // This avoids manually setting up Mongoose connections and handling env vars
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const productsService = app.get(ProductsService);
    const usersService = app.get(UsersService);

    console.log('🌱 Starting seed...');

    const bcrypt = await import('bcrypt');

    // 1. Create specific Suppliers
    const suppliers = [
      { email: 'supplier@middleeast.com', name: 'Middle East Trade Co', role: 'supplier' },
      { email: 'crafts@artifacts.com', name: 'Bedouin Crafts', role: 'supplier' }
    ];

    const supplierIds: string[] = [];

    for (const s of suppliers) {
      let user = await usersService.findByEmail(s.email);
      if (!user) {
        console.log(`Creating supplier: ${s.email}`);
        const passwordHash = await bcrypt.hash('password123', 10);
        user = await usersService.createWithPasswordHash({
           email: s.email,
           name: s.name,
           passwordHash,
           roles: [s.role as 'supplier'],
        });
      } else {
        console.log(`Found supplier: ${s.email}`);
      }
      // user is UserDocument here
      supplierIds.push(user._id.toString());
    }

    // 2. Sample Products Data (Middle East Theme)
    const sampleProducts: Partial<CreateProductDto>[] = [
        { title: 'Premium Medjool Dates', category: 'Food', priceCents: 2500, description: 'Organically grown Medjool dates from the Jordan Valley. Sweet, soft, and succulent.' },
        { title: 'Handwoven Persian Rug', category: 'Textiles', priceCents: 150000, description: 'Authentic hand-knotted wool rug with traditional geometric patterns. Size: 2m x 3m.' },
        { title: 'Za\'atar Spice Blend', category: 'Spices', priceCents: 1200, description: 'Traditional Palestinian thyme blend with toasted sesame seeds and sumac.' },
        { title: 'Olive Oil Soap', category: 'Cosmetics', priceCents: 500, description: 'Handmade Nablus soap made from pure virgin olive oil. Gentle on skin.' },
        { title: 'Brass Coffee Pot (Dallah)', category: 'Home', priceCents: 4500, description: 'Traditional Arabic coffee pot made of polished brass. Perfect for serving hospitality.' },
        { title: 'Saffron Threads (Grade A)', category: 'Spices', priceCents: 8500, description: 'Premium quality saffron threads harvested in Iran. Deep red color and potent aroma.' },
        { title: 'Mosaic Table Lamp', category: 'Home', priceCents: 6500, description: 'Turkish style mosaic glass lamp, handcrafted. Creates a warm, colorful ambiance.' },
        { title: 'Dead Sea Mud Mask', category: 'Cosmetics', priceCents: 1800, description: 'Mineral-rich mud mask from the Dead Sea. Purifies and detoxifies skin.' },
        { title: 'Aleppo Pepper Flakes', category: 'Spices', priceCents: 950, description: 'Sun-dried crushed chili flakes with a moderate heat and fruity flavor.' },
        { title: 'Ceramic Serving Bowl', category: 'Home', priceCents: 3200, description: 'Hand-painted ceramic bowl from Hebron. Vibrant blue floral patterns.' },
        { title: 'Oud Perfume Oil', category: 'Cosmetics', priceCents: 12000, description: 'Pure Agarwood oil scent. Long-lasting, woody, and luxurious fragrance.' },
        { title: 'Pistachio Baklava Box', category: 'Food', priceCents: 2800, description: 'Assorted box of traditional filo pastry sweets filled with pistachios and honey.' },
        { title: 'Leather Camel Sandals', category: 'Fashion', priceCents: 4000, description: 'Handcrafted leather sandals. Durable and comfortable for hot climates.' },
        { title: 'Turkish Cotton Towels', category: 'Textiles', priceCents: 3500, description: 'Set of 2 luxury bath towels. 100% organic Turkish cotton, high absorbency.' },
        { title: 'Arabian Horse Statue', category: 'Art', priceCents: 25000, description: 'Bronze cast statue of an Arabian horse. exquisite detail for collectors.' },
    ];

    // 3. Insert Products
    // We'll create duplicates to get "lots" of data if needed, or just these 15. 
    // Let's multiply them to get ~45 products.
    const fullList = [...sampleProducts, ...sampleProducts, ...sampleProducts];

    console.log(`Creating ${fullList.length} products...`);

    for (let i = 0; i < fullList.length; i++) {
        const item = fullList[i];
        const supplierId = supplierIds[i % supplierIds.length]; // cycle suppliers
        
        // Add random variation to prices and titles so they aren't identical
        const variance = Math.floor(Math.random() * 500); 
        const price = (item.priceCents || 1000) + variance;
        const uniqueTitle = i < 15 ? item.title! : `${item.title} ${Math.floor(Math.random() * 1000)}`;
        
        // Generate a relevant image URL based on keywords from title
        const keyword = item.title!.split(' ')[1] || 'market'; 
        // Using loremflickr for reliable random images with keywords
        const imageUrl = `https://loremflickr.com/640/480/${encodeURIComponent(keyword)}?lock=${i}`;

        await productsService.create(supplierId, {
            title: uniqueTitle,
            description: item.description!,
            priceCents: price,
            currency: 'USD',
            category: item.category!,
            minOrderQty: 1,
            imageUrls: [imageUrl], 
        });
    }

    // ─── Admin Bootstrap ──────────────────────────────────────────────────
    // Only runs if ADMIN_EMAIL and ADMIN_PASSWORD are set in .env.
    // This is the safest way to create a webmaster account:
    // no exposed HTTP endpoint, password never hardcoded in source.
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const existingAdmin = await usersService.findByEmail(adminEmail);
      if (!existingAdmin) {
        const adminHash = await bcrypt.hash(adminPassword, 12);
        await usersService.createWithPasswordHash({
          name: 'Webmaster',
          email: adminEmail,
          passwordHash: adminHash,
          roles: ['admin'],
        });
        console.log(`✅ Admin account created: ${adminEmail}`);
      } else {
        console.log(`ℹ️  Admin account already exists: ${adminEmail}`);
      }
    } else {
      console.log('ℹ️  Skipping admin bootstrap (ADMIN_EMAIL / ADMIN_PASSWORD not set in .env)');
    }

    console.log('✅ Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
