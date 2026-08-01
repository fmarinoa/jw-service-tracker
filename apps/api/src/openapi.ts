import * as fs from 'node:fs';
import * as path from 'node:path';

import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export function setupOpenApi(
  app: INestApplication,
  prefix: string,
  isProduction: boolean,
): void {
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

  const document = cleanupOpenApiDoc(
    SwaggerModule.createDocument(app, config, options),
  );

  if (!isProduction) {
    fs.writeFileSync(
      path.join(__dirname, '..', 'openapi.json'),
      JSON.stringify(document, null, 2),
    );
  }

  SwaggerModule.setup('swagger', app, document, { useGlobalPrefix: true });

  app
    .getHttpAdapter()
    .get(`${prefix}/openapi.json`, (_, res: import('express').Response) => {
      res.json(document);
    });

  app.use(
    `${prefix}/reference`,
    apiReference({
      url: `${prefix}/openapi.json`,
    }),
  );
}
