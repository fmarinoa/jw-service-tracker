import { UserStatus } from '@jw-tracker/shared';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

// Mock the direct repository imports to avoid instantiating a real MongoClient
jest.mock('@/repositories', () => ({
  invitationsRepository: { create: jest.fn() },
  usersRepository: { findByPhone: jest.fn(), findById: jest.fn() },
}));

import { SlackController } from '@/controllers/SlackController';
import { Invitation } from '@/domain/Invitation';
import { ApplicationType, RequestContext } from '@/domain/RequestContext';
import { InvitationsService } from '@/services/InvitationsService';
import { UserService } from '@/services/UserService';

describe('SlackController', () => {
  let controller: SlackController;
  let invitationsService: InvitationsService;
  let userService: UserService;
  const mockContext = new RequestContext({
    applicationType: ApplicationType.EXTERNAL,
    entityCode: 'SLACK',
  });

  beforeEach(async () => {
    const mockInvitationsService = {
      createInvitation: jest.fn(),
    };
    const mockUserService = {
      getUserById: jest.fn(),
      updateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlackController],
      providers: [
        { provide: InvitationsService, useValue: mockInvitationsService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<SlackController>(SlackController);
    invitationsService = module.get<InvitationsService>(InvitationsService);
    userService = module.get<UserService>(UserService);
  });

  const buildBody = (text: string) => ({ command: '/invitations', text });

  describe('unknown or empty subcommand', () => {
    it('returns the usage hint for an unknown subcommand', async () => {
      const result = await controller.handleCommand(
        buildBody('bogus'),
        mockContext,
      );

      expect(result.text).toContain('/invitations');
    });

    it('returns the usage hint when text is empty', async () => {
      const result = await controller.handleCommand(buildBody(''), mockContext);

      expect(result.text).toContain('/invitations');
    });
  });

  describe('create', () => {
    it('creates an invitation for any phone when none is given', async () => {
      const invitation = new Invitation({
        code: 'ABCD1234',
        expiresAt: Date.now() + 100_000,
      });
      (invitationsService.createInvitation as jest.Mock).mockResolvedValue(
        invitation,
      );

      const result = await controller.handleCommand(
        buildBody('create'),
        mockContext,
      );

      expect(invitationsService.createInvitation).toHaveBeenCalledWith(
        undefined,
      );
      expect(result.text).toContain('ABCD1234');
    });

    it('creates an invitation for a specific normalized phone', async () => {
      const invitation = new Invitation({
        code: 'ABCD1234',
        phone: '+51987654321',
        expiresAt: Date.now() + 100_000,
      });
      (invitationsService.createInvitation as jest.Mock).mockResolvedValue(
        invitation,
      );

      const result = await controller.handleCommand(
        buildBody('create 987654321'),
        mockContext,
      );

      expect(invitationsService.createInvitation).toHaveBeenCalledWith(
        '+51987654321',
      );
      expect(result.text).toContain('+51987654321');
    });

    it('rejects an invalid phone without calling the service', async () => {
      const result = await controller.handleCommand(
        buildBody('create 12345'),
        mockContext,
      );

      expect(invitationsService.createInvitation).not.toHaveBeenCalled();
      expect(result.text).toContain('9 dígitos');
    });
  });

  describe('approve', () => {
    it('requires a user id', async () => {
      const result = await controller.handleCommand(
        buildBody('approve'),
        mockContext,
      );

      expect(userService.getUserById).not.toHaveBeenCalled();
      expect(result.text).toContain('obligatorio');
    });

    it('returns a friendly message when the user does not exist', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(
        new NotFoundException('No se pudo encontrar el usuario con id user-1'),
      );

      const result = await controller.handleCommand(
        buildBody('approve user-1'),
        mockContext,
      );

      expect(result.response_type).toBe('ephemeral');
      expect(result.text).toContain('No se pudo encontrar');
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('returns a friendly message when the user is not pending', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phone: '+51987654321',
        status: UserStatus.APPROVED,
      });

      const result = await controller.handleCommand(
        buildBody('approve user-1'),
        mockContext,
      );

      expect(result.text).toContain('APPROVED');
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('approves a pending user', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phone: '+51987654321',
        status: UserStatus.PENDING,
      });
      (userService.updateUser as jest.Mock).mockResolvedValue({
        id: 'user-1',
        phone: '+51987654321',
        status: UserStatus.APPROVED,
      });

      const result = await controller.handleCommand(
        buildBody('approve user-1'),
        mockContext,
      );

      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          phone: '+51987654321',
          status: UserStatus.APPROVED,
        }),
        mockContext,
      );
      expect(result.text).toContain('+51987654321');
      expect(result.text).toContain('aprobado');
    });
  });
});
