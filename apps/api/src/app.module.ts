import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { LoggerMiddleware } from './middleware/LoggerMiddleware';
import { AuthSessionService } from './services/auth/AuthSessionService';
import { AuthTokenService } from './services/auth/AuthTokenService';
import { AuthService } from './services/AuthService';
import { UserService } from './services/UserService';
import { EntriesController } from './controllers/EntriesController';
import { EntriesService } from './services/EntriesService';

@Module({
  imports: [],
  controllers: [UserController, AuthController, EntriesController],
  providers: [AuthService, UserService, AuthTokenService, AuthSessionService, EntriesService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
