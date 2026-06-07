import { DateTime } from 'luxon';

export abstract class BaseRepository {
  protected getTimestamp(): number {
    return DateTime.now().toMillis();
  }

  protected generateUUID(): string {
    return crypto.randomUUID()
  }
}
