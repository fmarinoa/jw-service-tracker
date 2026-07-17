import { loadEnvFile } from 'node:process';

if (process.env.NODE_ENV !== 'production') {
  loadEnvFile();
}

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  const server = await app.listen(process.env.PORT ?? 3000);
  console.log('Server listening:', server.address());
}
bootstrap();
