import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, validAdminToken } from '../../../lib/admin-auth';
import { saveImage } from '../../../lib/image-store';
export const runtime = 'nodejs';
export async function POST(request) {
  const store = await cookies();
  if (!validAdminToken(store.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'Sessão do painel expirada.' }, { status: 401 });
  try {
    const body = await request.json();
    return NextResponse.json({ url: await saveImage(body.image) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Não foi possível salvar a foto.' }, { status: 400 });
  }
}
