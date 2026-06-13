import { NextResponse } from 'next/server';
import { usersRepository } from '@/repositories';
import { handlerApiRequest } from '../_utils';
import { User } from '@/domain/User';

export const PUT = handlerApiRequest(async (_req, { user, body }) => {
  const userToUpdate = User.validateForUpdate({ ...body, id: user.id });

  const updatedUser = await usersRepository.update(userToUpdate);

  if (!updatedUser) {
    return NextResponse.json({ error: 'No se pudo actualizar la configuración' }, { status: 400 });
  }

  return { success: true, user: updatedUser };
}, { requiresAuth: true });
