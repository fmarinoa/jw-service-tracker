if (process.env.NODE_ENV !== 'production') {
  require('node:process').loadEnvFile();
}

import * as fs from 'node:fs';
import * as path from 'node:path';

import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.enableCors();
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setOpenAPIVersion('3.2.0')
    .setTitle('JW Service Tracker API')
    .setDescription('API documentation for the JW Service Tracker application')
    .setVersion('1.0.0')
    .addServer('https://jw-service-tracker.vercel.app', 'Production server')
    .addServer('http://localhost:3000', 'Local development server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Bearer token authentication',
      },
      'BearerAuth',
    )
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);

  if (process.env.NODE_ENV !== 'production') {
    fs.writeFileSync(
      path.join(__dirname, '..', 'openapi.json'),
      JSON.stringify(document, null, 2),
    );
  }

  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  const server = await app.listen(process.env.PORT ?? 3000);
  console.log('Server listening:', JSON.stringify(server.address()));
}

bootstrap();
