import { NextResponse } from 'next/server';
import { sessionCookieConfig, sessionCookieName } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, '', { ...sessionCookieConfig, maxAge: 0 });
  return response;
}
