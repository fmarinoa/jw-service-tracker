import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthController } from './controllers/AuthController';
import { EntriesController } from './controllers/EntriesController';
import { HealthController } from './controllers/HealthController';
import { ReleasesController } from './controllers/ReleasesController';
import { UserController } from './controllers/UserController';
import { LoggerMiddleware } from './middleware/LoggerMiddleware';
import { AuthSessionService } from './services/auth/AuthSessionService';
import { AuthTokenService } from './services/auth/AuthTokenService';
import { AuthService } from './services/AuthService';
import { EntriesService } from './services/EntriesService';
import { ReleasesService } from './services/ReleasesService';
import { UserService } from './services/UserService';

@Module({
  imports: [],
  controllers: [
    UserController,
    AuthController,
    EntriesController,
    HealthController,
    ReleasesController,
  ],
  providers: [
    AuthService,
    UserService,
    AuthTokenService,
    AuthSessionService,
    EntriesService,
    ReleasesService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
