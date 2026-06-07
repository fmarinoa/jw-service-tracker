import { EntriesController } from './EntriesController';
import { entriesService } from '../services';

export const entriesController = new EntriesController({ service: entriesService });
