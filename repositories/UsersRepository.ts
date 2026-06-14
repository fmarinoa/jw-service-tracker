import bcrypt from "bcrypt";
import { DateTime } from "luxon";

import { User } from "@/domain/User";

import { BaseRepository, BaseRepositoryProps } from "./BaseRepository";

export class UsersRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async findByPhone(phone: string) {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne({ phone });
      if (!result) return null;
      const { _id, ...rest } = result;
      return new User({ ...rest, id: _id.toString() });
    });
  }

  async findById(id: string) {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne(this.buildIdFilter(id));
      if (!result) return null;
      const { _id, ...rest } = result;
      return new User({ ...rest, id: _id.toString() });
    });
  }

  async create(user: User): Promise<User> {
    return this.handlerCollection(async (collection) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const item = {
        ...this.cleanObject(user),
        name: user.name.toUpperCase(),
        password: hashedPassword,
        createdAt: DateTime.now().toMillis(),
      };
      const result = await collection.insertOne(item);
      return new User({ ...item, id: result.insertedId.toString() });
    });
  }

  async update(user: Partial<User>): Promise<User> {
    return this.handlerCollection(async (collection) => {
      const id = user.id;
      if (!id) {
        throw new Error("User ID is required for update");
      }

      const { id: _, ...updates } = user;
      const updatedAt = DateTime.now().toMillis();
      const item = {
        ...this.cleanObject(updates),
        updatedAt,
      };

      await collection.updateOne(this.buildIdFilter(id), {
        $set: item,
      });

      return new User({ ...user, updatedAt });
    });
  }
}
