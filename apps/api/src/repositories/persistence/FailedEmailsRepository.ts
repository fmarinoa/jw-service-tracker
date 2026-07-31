import { FailedEmail } from '@/domain/FailedEmail';

import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class FailedEmailsRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async create(email: Partial<FailedEmail>): Promise<FailedEmail> {
    return this.handlerCollection(async (collection) => {
      const item = {
        ...this.cleanObject(email),
        createdAt: this.getTimestamp(),
      };
      const result = await collection.insertOne(item);
      return new FailedEmail({ ...item, id: result.insertedId.toString() });
    });
  }
}
