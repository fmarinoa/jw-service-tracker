import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { authSessionsRepository } from '../repositories';
import { AuthTokenService } from '../services/auth/AuthTokenService';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authTokenService: AuthTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid authorization format. Use Bearer <token>',
      );
    }

    try {
      const payload = this.authTokenService.verifyAccessToken(token);

      // Stateful session validation: check if session is active in database
      if (payload.sid) {
        const session = await authSessionsRepository.findBySid(payload.sid);
        if (!session || !session.isActive()) {
          throw new UnauthorizedException(
            'Session has been revoked or expired',
          );
        }
      }

      request.user = {
        ...payload,
        id: payload.sub,
      };
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      throw new UnauthorizedException(message);
    }
  }
}
