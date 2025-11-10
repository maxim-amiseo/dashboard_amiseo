import { NextResponse } from 'next/server';
import { createSessionToken, sessionCookieConfig, sessionCookieName, verifyCredentials } from '@/lib/auth';
import { z } from 'zod';

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = credentialsSchema.parse(body);
  const user = await verifyCredentials(username, password);

  if (!user) {
    return NextResponse.json({ message: 'Identifiants invalides.' }, { status: 401 });
  }

  const token = await createSessionToken({
    id: user.id,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    clientId: user.clientId
  });

  const response = NextResponse.json({
    role: user.role,
    redirectTo: user.role === 'admin' ? '/admin' : '/dashboard'
  });

  response.cookies.set(sessionCookieName, token, sessionCookieConfig);
  return response;
}
