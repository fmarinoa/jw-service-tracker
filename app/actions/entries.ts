'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

import { Entry } from '@/lib/types';
import { DateTime } from 'luxon';
import { User } from '../domain/User';

export async function createEntry(data: Partial<Entry>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not authenticated');
  const user = new User(session.user as any);
  const client = await clientPromise;
  const db = client.db();

  const newEntry = {
    userId: user.id,
    ...data,
    createdAt: DateTime.now().toMillis(),
  };

  await db.collection('entries').insertOne(newEntry);
  revalidatePath('/');
}

export async function deleteEntry(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not authenticated');
  const user = new User(session.user as any);

  const client = await clientPromise;
  const db = client.db();

  await db.collection('entries').deleteOne({
    _id: new ObjectId(id),
    userId: user.id,
  });

  revalidatePath('/');
}

export async function updateEntry(id: string, data: Partial<Entry>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not authenticated');
  const user = new User(session.user as any);

  const client = await clientPromise;
  const db = client.db();

  await db.collection('entries').updateOne(
    { _id: new ObjectId(id), userId: user.id },
    {
      $set: {
        ...data,
        updatedAt: DateTime.now().toMillis(),
      },
    }
  );

  revalidatePath('/');
}
