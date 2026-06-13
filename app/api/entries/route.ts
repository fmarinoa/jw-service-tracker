import { User } from '@/domain/User';
import { Entry } from '@/domain/Entry';
import { entriesRepository } from '@/repositories';
import { handlerApiRequest } from '../_utils';

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
  
  const error = Entry.validate(body);
  if (error) {
    return { 
      status: 400, 
      body: { error } 
    };
  }

  const entry = await entriesRepository.create(domainUser, body);

  return { success: true, entry };
}, { requiresAuth: true, responseHttpCode: 201 });
