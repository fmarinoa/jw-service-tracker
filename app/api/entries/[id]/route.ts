import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-options';
import { User } from '@/domain/User';
import { entriesRepository } from '@/repositories';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { id } = params;
    const data = await req.json();
    const domainUser = new User(user);
    
    await entriesRepository.update(domainUser, id, data);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { id } = params;
    const domainUser = new User(user);
    
    await entriesRepository.delete(domainUser, id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
