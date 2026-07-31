import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { ApplicationType, RequestContext } from '@/domain/RequestContext';

export const AppContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestContext => {
    if (ctx.getType() === 'http') {
      const context = getApiContext(ctx);
      return context;
    }
    throw new InternalServerErrorException(
      'AppContext decorator can only be used in HTTP context',
    );
  },
);

function getApiContext(ctx: ExecutionContext): RequestContext {
  const request = ctx.switchToHttp().getRequest();
  const applicationType = request?.applicationType;

  if (!applicationType) {
    return new RequestContext({
      applicationType: ApplicationType.INTERNAL,
    });
  }

  switch (applicationType) {
    case ApplicationType.CUSTOMER:
      return new RequestContext({
        applicationType: applicationType,
        userId: request?.userId,
      });
    case ApplicationType.EXTERNAL:
      return new RequestContext({
        applicationType: applicationType,
        entityCode: request?.entityCode,
      });
    default:
      throw new InternalServerErrorException('Invalid application type');
  }
}
