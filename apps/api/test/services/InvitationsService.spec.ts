import { Test, TestingModule } from '@nestjs/testing';

import { InvitationsService } from '@/services/InvitationsService';

jest.mock('@/repositories', () => ({
  invitationsRepository: {
    create: jest.fn(),
  },
}));

import { invitationsRepository } from '@/repositories';

describe('InvitationsService', () => {
  let invitationsService: InvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationsService],
    }).compile();

    invitationsService = module.get<InvitationsService>(InvitationsService);
    jest.clearAllMocks();
    (invitationsRepository.create as jest.Mock).mockImplementation((inv) =>
      Promise.resolve({ ...inv, id: 'inv-1' }),
    );
  });

  it('creates an invitation with an 8-character uppercase hex code and no phone', async () => {
    const result = await invitationsService.createInvitation();

    expect(result.code).toMatch(/^[0-9A-F]{8}$/);
    expect(result.phone).toBeUndefined();
    expect(invitationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ code: result.code }),
    );
  });

  it('creates an invitation bound to the given phone as-is', async () => {
    const result = await invitationsService.createInvitation('+51987654321');

    expect(result.phone).toBe('+51987654321');
    expect(invitationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+51987654321' }),
    );
  });

  it('sets expiresAt roughly 7 days in the future', async () => {
    const before = Date.now();
    const result = await invitationsService.createInvitation();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(result.expiresAt).toBeGreaterThanOrEqual(
      before + sevenDaysMs - 5000,
    );
    expect(result.expiresAt).toBeLessThanOrEqual(before + sevenDaysMs + 5000);
  });
});
