import { BadRequestException, ForbiddenException } from '@nestjs/common';

export enum ApplicationType {
  CUSTOMER = 'CUSTOMER',
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
}

export class RequestContext {
  applicationType: ApplicationType;
  userId?: string;
  entityCode?: string;

  constructor(data: Partial<RequestContext>) {
    Object.assign(this, data);
  }

  requireUserId(): string {
    if (!this.userId) {
      throw new BadRequestException('User not found in request context');
    }
    return this.userId;
  }

  validateSecurity(
    rules: {
      type: ApplicationType;
      requiredEntities?: string[];
    }[],
  ): void {
    const { applicationType } = this;

    const rule = rules.find((r) => r.type === applicationType);

    if (!rule) {
      throw new ForbiddenException();
    }

    switch (applicationType) {
      case ApplicationType.CUSTOMER:
        if (!this.userId) throw new ForbiddenException();
        break;
      case ApplicationType.EXTERNAL:
        this.validateEntities(rule.requiredEntities || []);
        break;
      case ApplicationType.INTERNAL:
        break;
      default:
        throw new ForbiddenException();
    }
  }

  private validateEntities(requiredEntities: string[]): void {
    if (
      requiredEntities.length &&
      (!this.entityCode || !requiredEntities.includes(this.entityCode))
    )
      throw new ForbiddenException();
  }
}
