import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const time = new Date().toISOString();
    const { method, originalUrl, body } = req;
    const splitUrl = originalUrl.split('?');
    const path = splitUrl[0];
    const query = splitUrl[1];

    const logMessage: string[] = [`[${time}] INFO ${method} ${path}`];

    if (query) {
      logMessage.push(` - Query: ${query}`);
    }

    if (body) {
      logMessage.push(` - Body: ${JSON.stringify(body)}`);
    }

    console.log(logMessage.join(''));

    next();
  }
}
