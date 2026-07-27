import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AuthController } from './controllers/AuthController';
import { EntriesController } from './controllers/EntriesController';
import { HealthController } from './controllers/HealthController';
import { ReleasesController } from './controllers/ReleasesController';
import { SlackController } from './controllers/SlackController';
import { UserController } from './controllers/UserController';
import { NotificationsListener } from './listeners/NotificationsListener';
import { LoggerMiddleware } from './middleware/LoggerMiddleware';
import { AuthSessionService } from './services/auth/AuthSessionService';
import { AuthTokenService } from './services/auth/AuthTokenService';
import { AuthService } from './services/AuthService';
import { EntriesService } from './services/EntriesService';
import { InvitationsService } from './services/InvitationsService';
import { NotificationsService } from './services/NotificationsService';
import { ReleasesService } from './services/ReleasesService';
import { UserService } from './services/UserService';

@Module({
  imports: [EventEmitterModule.forRoot({})],
  controllers: [
    UserController,
    AuthController,
    EntriesController,
    HealthController,
    ReleasesController,
    SlackController,
  ],
  providers: [
    AuthService,
    UserService,
    AuthTokenService,
    AuthSessionService,
    EntriesService,
    ReleasesService,
    InvitationsService,
    NotificationsService,
    NotificationsListener,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
