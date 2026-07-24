import { dbConnection } from '../db';
import { EntriesService } from './entries.service';
import { InvitationsService } from './invitations.service';
import { UsersService } from './users.service';

export const entriesService = new EntriesService({ dbConnection });
export const usersService = new UsersService({ dbConnection });
export const invitationsService = new InvitationsService({ dbConnection });

export * from './entries.service';
export * from './invitations.service';
export * from './users.service';
