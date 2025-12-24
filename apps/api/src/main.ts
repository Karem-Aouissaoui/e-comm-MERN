import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  /**
   * Create the NestJS application instance.
   * At this point, NO middleware or configuration is active yet.
   */
  const app = await NestFactory.create(AppModule);

  /**
   * cookie-parser middleware
   * REQUIRED so req.cookies exists.
   * Without this, JWT cookies CANNOT be read.
   */
  app.use(cookieParser(process.env.COOKIE_SECRET));

  /**
   * CORS CONFIGURATION
   *
   * This MUST be in main.ts because:
   * - CORS is an application-level concern
   * - It must run before any controller handles requests
   *
   * credentials: true
   * → allows cookies (JWT) to be sent from frontend
   *
   * origin
   * → must match your frontend URL exactly
   */
  app.enableCors({
    origin: ['http://localhost:5173'], // React dev server
    credentials: true,
  });

  /**
   * Global validation pipe
   * Automatically validates DTOs and strips unknown fields
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Start HTTP server
   */
  await app.listen(3001);
}

bootstrap();
