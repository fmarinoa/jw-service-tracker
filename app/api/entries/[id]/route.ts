import { User } from '@/domain/User';
import { Entry } from '@/domain/Entry';
import { entriesRepository } from '@/repositories';
import { handlerApiRequest } from '../../_utils';
import { NextResponse } from 'next/server';

export const PUT = handlerApiRequest(async (_req, { user, params, body }) => {
  const { id } = params;
  const domainUser = new User(user);
  let entry: Entry;

  try {
    entry = Entry.validateForUpdate({ ...body, id });
    entry.validateHourPlusMinutes();
    entry.preachingDateNotInFuture();
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }

  const updatedEntry = await entriesRepository.update(domainUser, entry);
  
  return { success: true, entry: updatedEntry };
}, { requiresAuth: true });

export const DELETE = handlerApiRequest(async (_req, { user, params }) => {
  const { id } = params;
  const domainUser = new User(user);
  
  await entriesRepository.delete(domainUser, id);
  
  return { success: true };
}, { requiresAuth: true });
