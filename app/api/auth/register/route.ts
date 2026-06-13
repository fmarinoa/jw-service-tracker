import { NextResponse } from 'next/server';
import { User } from '@/domain/User';
import { usersRepository } from '@/repositories';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = User.validateForRegistration(data);
    const existingUser = await usersRepository.findByPhone(user.phone);

    if (existingUser) {
      return NextResponse.json({ error: 'El celular ya está registrado.' }, { status: 409 });
    }

    const createdUser = await usersRepository.create(user);
    // Serialize for response
    const { password, ...safeUser } = createdUser;
    
    return NextResponse.json({ user: safeUser, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en el registro' }, { status: 500 });
  }
}
