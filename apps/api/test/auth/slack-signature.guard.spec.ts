import crypto from 'node:crypto';

import {
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { SlackSignatureGuard } from '@/auth/slack-signature.guard';

describe('SlackSignatureGuard', () => {
  const SIGNING_SECRET = 'test-signing-secret';
  let guard: SlackSignatureGuard;

  const buildContext = (
    headers: Record<string, string>,
    rawBody?: Buffer,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers, rawBody }),
      }),
    }) as unknown as ExecutionContext;

  const sign = (timestamp: string, body: string): string => {
    const baseString = `v0:${timestamp}:${body}`;
    return `v0=${crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(baseString)
      .digest('hex')}`;
  };

  beforeEach(() => {
    guard = new SlackSignatureGuard();
    process.env.SLACK_SIGNING_SECRET = SIGNING_SECRET;
  });

  afterEach(() => {
    delete process.env.SLACK_SIGNING_SECRET;
  });

  it('throws InternalServerErrorException if SLACK_SIGNING_SECRET is not configured', () => {
    delete process.env.SLACK_SIGNING_SECRET;
    const context = buildContext({}, Buffer.from(''));

    expect(() => guard.canActivate(context)).toThrow(
      InternalServerErrorException,
    );
  });

  it('throws UnauthorizedException if signature header is missing', () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const context = buildContext(
      { 'x-slack-request-timestamp': timestamp },
      Buffer.from('text=hello'),
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException if rawBody is missing', () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const context = buildContext({
      'x-slack-signature': 'v0=whatever',
      'x-slack-request-timestamp': timestamp,
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException if timestamp is older than 5 minutes', () => {
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 60 * 10);
    const body = 'text=hello';
    const signature = sign(staleTimestamp, body);
    const context = buildContext(
      {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': staleTimestamp,
      },
      Buffer.from(body),
    );

    expect(() => guard.canActivate(context)).toThrow(
      'Slack request timestamp is stale',
    );
  });

  it('throws UnauthorizedException if signature does not match', () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = 'text=hello';
    const context = buildContext(
      {
        'x-slack-signature': 'v0=deadbeef',
        'x-slack-request-timestamp': timestamp,
      },
      Buffer.from(body),
    );

    expect(() => guard.canActivate(context)).toThrow('Invalid Slack signature');
  });

  it('returns true for a validly signed request', () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = 'command=/invitations&text=create';
    const signature = sign(timestamp, body);
    const context = buildContext(
      {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': timestamp,
      },
      Buffer.from(body),
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
