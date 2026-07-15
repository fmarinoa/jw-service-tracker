import { Module } from '@nestjs/common';
import { UserController } from './controllers/UserController';
import { UserService } from './services/UserService';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
