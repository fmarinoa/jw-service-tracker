import crypto from 'node:crypto';

import { DateTime } from 'luxon';
import { Db } from 'mongodb';

import { DbConnection } from '../db/connection';

export interface InvitationDoc {
  id: string;
  code: string;
  phone?: string;
  usedAt?: number | null;
  usedBy?: string | null;
  expiresAt: number;
  createdAt: number;
}

export interface InvitationsServiceProps {
  dbConnection: DbConnection;
}

const DEFAULT_EXPIRES_IN_DAYS = 7;

export class InvitationsService {
  private dbConnection: DbConnection;

  constructor(props: InvitationsServiceProps) {
    this.dbConnection = props.dbConnection;
  }

  private get db(): Db {
    return this.dbConnection.getDb();
  }

  /**
   * Creates a new invitation code, optionally bound to a specific phone number.
   */
  async createInvitation(
    phone?: string,
    expiresInDays: number = DEFAULT_EXPIRES_IN_DAYS,
  ): Promise<InvitationDoc> {
    const today = DateTime.now();
    const invitationsCollection = this.db.collection('invitations');
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const newDoc = {
      code,
      expiresAt: today.plus({ days: expiresInDays }).toMillis(),
      createdAt: today.toMillis(),
      ...(phone
        ? { phone: phone.startsWith('+51') ? phone : `+51${phone}` }
        : {}),
    };
    const result = await invitationsCollection.insertOne(newDoc);
    return {
      id: result.insertedId.toString(),
      ...newDoc,
      phone: newDoc.phone ?? undefined,
    };
  }

  /**
   * Lists all invitations, most recent first.
   */
  async listInvitations(): Promise<InvitationDoc[]> {
    const invitationsCollection = this.db.collection('invitations');
    const docs = await invitationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      code: doc.code,
      phone: doc.phone ?? undefined,
      usedAt: doc.usedAt,
      usedBy: doc.usedBy,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    }));
  }
}
