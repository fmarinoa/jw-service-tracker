import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-options';
import { User } from '@/domain/User';
import { entriesRepository } from '@/repositories';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const domainUser = new User(user);
  const entries = await entriesRepository.getByUser(domainUser);

  // Serialize for JSON response
  const serializedEntries = entries.map(entry => ({
    ...entry,
    user: { ...entry.user }
  }));

  return NextResponse.json(serializedEntries);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const data = await req.json();
    const domainUser = new User(user);
    await entriesRepository.create(domainUser, data);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
