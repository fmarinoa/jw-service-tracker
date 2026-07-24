import { Invitation } from '@/domain/Invitation';

import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class InvitationsRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async findByCode(code: string) {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne({ code });
      if (!result) return null;
      const { _id, ...rest } = result;
      return new Invitation({ ...rest, id: _id.toString() });
    });
  }

  async create(invitation: Invitation): Promise<Invitation> {
    return this.handlerCollection(async (collection) => {
      const item = {
        ...this.cleanObject(invitation),
        createdAt: this.getTimestamp(),
      };
      const result = await collection.insertOne(item);
      return new Invitation({ ...item, id: result.insertedId.toString() });
    });
  }

  async markUsed(id: string, usedBy: string): Promise<void> {
    return this.handlerCollection(async (collection) => {
      await collection.updateOne(this.buildIdFilter(id), {
        $set: { usedAt: this.getTimestamp(), usedBy },
      });
    });
  }
}
