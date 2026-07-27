import crypto from 'node:crypto';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

const MAX_TIMESTAMP_SKEW_SECONDS = 60 * 5; // 5 minutes

@Injectable()
export class SlackSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    if (!signingSecret) {
      throw new InternalServerErrorException(
        'SLACK_SIGNING_SECRET is not configured.',
      );
    }

    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-slack-signature'];
    const timestamp = request.headers['x-slack-request-timestamp'];
    const rawBody: Buffer | undefined = request.rawBody;

    if (!signature || !timestamp || !rawBody) {
      throw new UnauthorizedException('Missing Slack signature headers');
    }

    const timestampSeconds = Number(timestamp);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      !Number.isFinite(timestampSeconds) ||
      Math.abs(nowSeconds - timestampSeconds) > MAX_TIMESTAMP_SKEW_SECONDS
    ) {
      throw new UnauthorizedException('Slack request timestamp is stale');
    }

    const baseString = `v0:${timestamp}:${rawBody.toString('utf8')}`;
    const expectedSignature = `v0=${crypto
      .createHmac('sha256', signingSecret)
      .update(baseString)
      .digest('hex')}`;

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    const isValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      throw new UnauthorizedException('Invalid Slack signature');
    }

    return true;
  }
}
