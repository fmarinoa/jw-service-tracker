import { PreacherType, UserStatus } from '@jw-tracker/shared';
import { NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { User } from '@/domain/User';

import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class UsersRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async findByPhone(phone: string) {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne({ phone });
      if (!result) {
        throw new NotFoundException(`User with phone ${phone} not found`);
      }
      const { _id, ...rest } = result;
      return new User({ ...rest, id: _id.toString() });
    });
  }

  async findById(id: string) {
    return this.handlerCollection(async (collection) => {
      const result = await collection.findOne(this.buildIdFilter(id));
      if (!result) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      const { _id, ...rest } = result;
      return new User({ ...rest, id: _id.toString() });
    });
  }

  async create(user: User): Promise<User> {
    return this.handlerCollection(async (collection) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const item = {
        ...this.cleanObject(user),
        name: user.name.trim().toUpperCase(),
        password: hashedPassword,
        preacherType: PreacherType.publisher,
        monthlyGoal: 0,
        showTutorial: true,
        createdAt: this.getTimestamp(),
      };
      const result = await collection.insertOne(item);
      return new User({ ...item, id: result.insertedId.toString() });
    });
  }

  async update(user: Partial<User>): Promise<User> {
    return this.handlerCollection(async (collection) => {
      const id = user.id;
      if (!id) {
        throw new Error('User ID is required for update');
      }

      const updatedAt = this.getTimestamp();

      await collection.updateOne(this.buildIdFilter(id), {
        $set: {
          monthlyGoal: user.monthlyGoal,
          preacherType: user.preacherType,
          updatedAt,
        },
      });

      return new User({
        id,
        updatedAt,
        monthlyGoal: user.monthlyGoal,
        preacherType: user.preacherType,
      });
    });
  }

  async confirmTutorial(user: Partial<User>): Promise<User> {
    return this.handlerCollection(async (collection) => {
      const id = user.id;
      if (!id) {
        throw new Error('User ID is required for update');
      }

      const updatedAt = this.getTimestamp();

      await collection.updateOne(this.buildIdFilter(id), {
        $set: {
          showTutorial: false,
          updatedAt,
        },
      });

      return new User({
        id,
        showTutorial: false,
        updatedAt,
      });
    });
  }

  async confirmApproval(user: Partial<User>): Promise<User> {
    return this.handlerCollection(async (collection) => {
      const id = user.id;
      if (!id) {
        throw new Error('User ID is required for update');
      }

      const updatedAt = this.getTimestamp();
      const status = UserStatus.APPROVED;

      await collection.updateOne(this.buildIdFilter(id), {
        $set: {
          status,
          updatedAt,
        },
      });

      return new User({
        id,
        status,
        updatedAt,
      });
    });
  }
}
