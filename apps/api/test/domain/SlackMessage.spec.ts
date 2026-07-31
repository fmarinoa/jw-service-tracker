import { UserStatus } from '@jw-tracker/shared';

import { Invitation } from '@/domain/Invitation';
import { SlackMessage } from '@/domain/SlackMessage';
import { User } from '@/domain/User';

describe('SlackMessage.validatePhone', () => {
  it('is valid with no phone when not required', () => {
    const result = SlackMessage.validatePhone(undefined, false);

    expect(result).toEqual({ valid: true, phone: undefined });
  });

  it('is invalid with no phone when required', () => {
    const result = SlackMessage.validatePhone(undefined, true);

    expect(result.valid).toBe(false);
    expect(result.error?.text).toContain('obligatorio');
  });

  it('is invalid for a phone with wrong format', () => {
    const result = SlackMessage.validatePhone('12345', false);

    expect(result.valid).toBe(false);
    expect(result.error?.text).toContain('9 dígitos');
  });

  it('normalizes a valid phone by adding +51', () => {
    const result = SlackMessage.validatePhone('987654321', false);

    expect(result).toEqual({ valid: true, phone: '+51987654321' });
  });

  it('rejects a phone already prefixed with +51 (only local 9-digit format is accepted)', () => {
    const result = SlackMessage.validatePhone('+51987654321', false);

    expect(result.valid).toBe(false);
  });
});

describe('SlackMessage.buildInvitationCreatedMessage', () => {
  it('includes the phone when the invitation is bound to one', () => {
    const invitation = new Invitation({
      code: 'ABCD1234',
      phone: '+51987654321',
      expiresAt: Date.now() + 100_000,
    });

    const result = SlackMessage.buildInvitationCreatedMessage(
      invitation,
      'U12345',
    );

    expect(result.response_type).toBe('in_channel');
    expect(result.text).toContain('ABCD1234');
    expect(result.text).toContain('+51987654321');
  });

  it('shows "cualquiera" when the invitation has no phone', () => {
    const invitation = new Invitation({
      code: 'ABCD1234',
      expiresAt: Date.now() + 100_000,
    });

    const result = SlackMessage.buildInvitationCreatedMessage(
      invitation,
      'U12345',
    );

    expect(result.text).toContain('cualquiera');
  });
});

describe('SlackMessage.buildUserApprovedMessage', () => {
  it('includes the phone of the approved user', () => {
    const user = new User({
      id: 'user-1',
      phone: '+51987654321',
      status: UserStatus.APPROVED,
    });

    const result = SlackMessage.buildUserApprovedMessage(user, 'U12345');

    expect(result.response_type).toBe('in_channel');
    expect(result.text).toContain('+51987654321');
    expect(result.text).toContain('aprobado');
  });
});

describe('SlackMessage.buildDefaultMessage', () => {
  it('returns a usage hint', () => {
    const result = SlackMessage.buildDefaultMessage();

    expect(result.response_type).toBe('ephemeral');
    expect(result.text).toContain('/invitations');
  });
});
