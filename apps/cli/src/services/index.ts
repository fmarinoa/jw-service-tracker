import { dbConnection } from '../db';
import { EntriesService } from './entries.service';
import { UsersService } from './users.service';

export const entriesService = new EntriesService({ dbConnection });
export const usersService = new UsersService({ dbConnection });

export * from './entries.service';
export * from './users.service';
