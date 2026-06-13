import { NextResponse } from 'next/server';
import { User } from '@/domain/User';
import { entriesRepository } from '@/repositories';
import { handlerApiRequest } from '../../_utils';

export const PUT = handlerApiRequest(async (_req, { user, params, body }) => {
  const { id } = params;
  const domainUser = new User(user);
  
  const updatedEntry = await entriesRepository.update(domainUser, id, body);
  
  return { success: true, entry: updatedEntry };
}, { requiresAuth: true });

export const DELETE = handlerApiRequest(async (_req, { user, params }) => {
  const { id } = params;
  const domainUser = new User(user);
  
  await entriesRepository.delete(domainUser, id);
  
  return { success: true };
}, { requiresAuth: true });
