import { User } from '@/domain/User';
import { Entry } from '@/domain/Entry';
import { entriesRepository } from '@/repositories';
import { handlerApiRequest } from '../_utils';
import { NextResponse } from 'next/server';

export const GET = handlerApiRequest(async (_req, { user }) => {
  const domainUser = new User(user);
  const entries = await entriesRepository.getByUser(domainUser);

  // Return data directly, handler will wrap in JSON
  return entries.map(entry => ({
    ...entry,
    user: { ...entry.user }
  }));
}, { requiresAuth: true });

export const POST = handlerApiRequest(async (_req, { user, body }) => {
  const domainUser = new User(user);

  let entry: Entry;
  try {
    entry = Entry.validateForCreate(body);
    entry.validateHourPlusMinutes();
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }

  const entryCreated = await entriesRepository.create(domainUser, entry);

  return NextResponse.json({ success: true, entry: entryCreated }, { status: 201 });
}, { requiresAuth: true });
