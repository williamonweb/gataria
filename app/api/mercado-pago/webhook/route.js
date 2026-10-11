import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function signatureIsValid(request, dataId) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const signature = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const values = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  if (!values.ts || !values.v1) return false;

  let manifest = '';
  if (dataId) manifest += `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${values.ts};`;
  const calculated = createHmac('sha256', secret).update(manifest).digest('hex');
  const received = Buffer.from(values.v1, 'hex');
  const expected = Buffer.from(calculated, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch {}
  const dataId = request.nextUrl.searchParams.get('data.id') || body?.data?.id;
  const type = request.nextUrl.searchParams.get('type') || body?.type;

  if (!signatureIsValid(request, dataId)) return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 });
  if (!dataId || (type && type !== 'payment')) return NextResponse.json({ received: true });

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) return NextResponse.json({ received: true });

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });
    if (!response.ok) return NextResponse.json({ received: true });
    const payment = await response.json();
    console.info('Atualização de pagamento Gataria.', {
      paymentId: payment.id,
      status: payment.status,
      externalReference: payment.external_reference
    });
  } catch (error) {
    console.error('Não foi possível consultar a atualização do pagamento.', error);
  }

  return NextResponse.json({ received: true });
}
