import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { LoggerMiddleware } from './middleware/LoggerMiddleware';
import { AuthSessionService } from './services/auth/AuthSessionService';
import { AuthTokenService } from './services/auth/AuthTokenService';
import { AuthService } from './services/AuthService';
import { UserService } from './services/UserService';

@Module({
  imports: [],
  controllers: [UserController, AuthController],
  providers: [AuthService, UserService, AuthTokenService, AuthSessionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
