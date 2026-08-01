const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  require('node:process').loadEnvFile();
}

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupOpenApi } from './openapi';

const PREFIX = '/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.enableCors();
  app.setGlobalPrefix(PREFIX);

  setupOpenApi(app, PREFIX, isProduction);

  const server = await app.listen(process.env.PORT ?? 3000);
  console.log('Server listening:', JSON.stringify(server.address()));
}

bootstrap();
