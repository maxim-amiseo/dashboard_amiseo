import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { getUserByUsername, UserRecord } from './data';

export type SessionUser = Pick<UserRecord, 'id' | 'username' | 'role' | 'displayName' | 'clientId'>;

const SESSION_COOKIE = 'amiseo_session';
const encoder = new TextEncoder();
const sessionSecret = () => encoder.encode(process.env.SESSION_SECRET ?? 'amiseo-dashboard-secret');

export async function verifyCredentials(username: string, password: string) {
  const user = await getUserByUsername(username);

  if (!user || user.password !== password) {
    return null;
  }

  return user;
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ sub: user.id, ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(sessionSecret());
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(cookie.value, sessionSecret());
    const { username, role, displayName, clientId, sub } = payload as Record<string, string>;
    return {
      id: typeof sub === 'string' ? sub : '',
      username: String(username),
      role: role === 'admin' ? 'admin' : 'client',
      displayName: String(displayName),
      clientId: clientId ?? undefined
    };
  } catch {
    return null;
  }
}

export const sessionCookieName = SESSION_COOKIE;

const isProd = process.env.NODE_ENV === 'production';

export const sessionCookieConfig = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7
};
