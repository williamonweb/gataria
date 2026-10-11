import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, validAdminToken } from '../../../lib/admin-auth';
import { getSiteContent, saveSiteContent } from '../../../lib/content-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return NextResponse.json({ content: await getSiteContent() }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Não foi possível carregar o catálogo.' }, { status: 500 }); }
}
export async function PUT(request) {
  const cookieStore = await cookies();
  if (!validAdminToken(cookieStore.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'Sessão do painel expirada.' }, { status: 401 });
  try {
    const body = await request.json();
    return NextResponse.json({ content: await saveSiteContent(body.content) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Não foi possível publicar.' }, { status: 500 });
  }
}
