import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, cmsPassword, cmsUsername, createAdminToken, validAdminToken, validPassword, validUsername } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({ authenticated: validAdminToken(cookieStore.get(ADMIN_COOKIE)?.value), configured: Boolean(cmsUsername() && cmsPassword()) });
}
export async function POST(request) {
  if (!cmsUsername() || !cmsPassword()) return NextResponse.json({ error: 'Configure CMS_USERNAME e CMS_PASSWORD nas variáveis da Vercel e faça um novo deploy.' }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Dados de login inválidos.' }, { status: 400 }); }
  const { username = '', password = '' } = body || {};
  if (typeof username !== 'string' || typeof password !== 'string') return NextResponse.json({ error: 'Dados de login inválidos.' }, { status: 400 });
  if (!validUsername(username) || !validPassword(password)) return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 });
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 });
  return response;
}
export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
