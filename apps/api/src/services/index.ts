import { EntriesServiceImp } from './EntriesServiceImp';
import { entriesRepository } from '../repositories';

export const entriesService = new EntriesServiceImp({ repository: entriesRepository });
