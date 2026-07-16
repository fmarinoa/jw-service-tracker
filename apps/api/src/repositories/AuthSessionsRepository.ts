import { AuthSession } from '@/domain/AuthSession';

import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class AuthSessionsRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async findById(id: string): Promise<AuthSession | null> {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne(this.buildIdFilter(id));
      if (!result) return null;
      const { _id, ...rest } = result;
      return new AuthSession({ ...rest, id: _id.toString() });
    });
  }

  async findByTokenHash(refreshTokenHash: string): Promise<AuthSession | null> {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne({ refreshTokenHash });
      if (!result) return null;
      const { _id, ...rest } = result;
      return new AuthSession({ ...rest, id: _id.toString() });
    });
  }

  async findByUserId(userId: string): Promise<AuthSession | null> {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne({ userId });
      if (!result) return null;
      const { _id, ...rest } = result;
      return new AuthSession({ ...rest, id: _id.toString() });
    });
  }

  async findBySid(sid: string): Promise<AuthSession | null> {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne({ sid });
      if (!result) return null;
      const { _id, ...rest } = result;
      return new AuthSession({ ...rest, id: _id.toString() });
    });
  }

  async create(session: AuthSession): Promise<AuthSession> {
    return this.handlerCollection(async (collection) => {
      const { id: _, ...rest } = session;
      const item = {
        ...this.cleanObject(rest),
        createdAt: this.getTimestamp(),
      };
      const result = await collection.insertOne(item);
      return new AuthSession({ ...item, id: result.insertedId.toString() });
    });
  }

  async update(session: Partial<AuthSession>): Promise<AuthSession> {
    return this.handlerCollection(async (collection) => {
      const id = session.id;
      if (!id) {
        throw new Error('Session ID is required for update');
      }
      const { id: _, ...updateFields } = session;

      await collection.updateOne(this.buildIdFilter(id), {
        $set: {
          refreshTokenHash: updateFields.refreshTokenHash,
          updatedAt: this.getTimestamp(),
        },
      });

      const updated = await collection.findOne(this.buildIdFilter(id));
      if (!updated) {
        throw new Error(`Session with ID ${id} not found after update`);
      }
      const { _id, ...rest } = updated;
      return new AuthSession({ ...rest, id: _id.toString() });
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    return this.handlerCollection(async (collection) => {
      await collection.updateMany(
        { userId, revokedAt: null },
        { $set: { revokedAt: this.getTimestamp() } },
      );
    });
  }
}
