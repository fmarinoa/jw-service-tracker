import { DateTime } from 'luxon';
import { Db, ObjectId } from 'mongodb';

import { DbConnection } from '../db/connection';

export interface UserDoc {
  id: string;
  name: string;
  phone: string;
  preacherType?: string;
  monthlyGoal?: number;
  status?: string;
}

export interface UsersServiceProps {
  dbConnection: DbConnection;
}

export class UsersService {
  private dbConnection: DbConnection;

  constructor(props: UsersServiceProps) {
    this.dbConnection = props.dbConnection;
  }

  private get db(): Db {
    return this.dbConnection.getDb();
  }

  /**
   * Finds users by name (partial case-insensitive), phone, or MongoDB ObjectId.
   */
  async findUsers(customerQuery: string): Promise<UserDoc[]> {
    const usersCollection = this.db.collection('users');
    let userQuery: any;
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(customerQuery);
    const isPhone = /^\+?9\d{8,11}$/.test(customerQuery.replace(/\s+/g, ''));

    if (isObjectId) {
      userQuery = { _id: new ObjectId(customerQuery) };
    } else if (isPhone) {
      const cleanPhone = customerQuery.replace(/[\s+]+/g, '');
      const phoneRegex = /^9\d{8}$/;
      if (phoneRegex.test(cleanPhone)) {
        userQuery = {
          $or: [{ phone: cleanPhone }, { phone: `+51${cleanPhone}` }],
        };
      } else {
        userQuery = {
          $or: [
            { phone: customerQuery },
            { phone: `+${cleanPhone}` },
            { phone: cleanPhone },
          ],
        };
      }
    } else {
      userQuery = { name: { $regex: new RegExp(customerQuery, 'i') } };
    }

    const docs = await usersCollection.find(userQuery).toArray();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      phone: doc.phone,
      preacherType: doc.preacherType,
      monthlyGoal: doc.monthlyGoal,
      status: doc.status,
    }));
  }

  async getUsers(filters: { status?: string } = {}): Promise<UserDoc[]> {
    const { status } = filters;
    const query: any = {};
    if (status !== undefined) {
      query.status = status;
    }
    const usersCollection = this.db.collection('users');
    const docs = await usersCollection.find(query).toArray();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      phone: doc.phone,
      preacherType: doc.preacherType,
      monthlyGoal: doc.monthlyGoal,
      status: doc.status,
    }));
  }

  /**
   * Approves a pending user, unblocking their login.
   */
  async approveUser(id: string): Promise<void> {
    const usersCollection = this.db.collection('users');
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'APPROVED', updatedAt: DateTime.now().toMillis() } },
    );
  }
}
