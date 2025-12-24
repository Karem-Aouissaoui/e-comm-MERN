import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthDemoController } from './auth-demo.controller';

@Module({
  imports: [
    UsersModule,

    /**
     * JwtModule provides JwtService for signing tokens.
     * We use ConfigService so secrets come from .env.
     */
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_secret_change_me',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController, AuthDemoController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
