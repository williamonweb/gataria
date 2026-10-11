import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { DEFAULT_CONTENT } from '../../../content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseBRL(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value || '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeBaseUrl(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate = configured || new URL(request.url).origin;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('URL da loja inválida.');
  return url.origin;
}

function validateVariant(product, field, value) {
  const options = product[field] || [];
  if (!options.length) return '';
  if (!options.includes(value)) throw new Error(`Variação inválida para ${product.name}.`);
  return value;
}

function buildItems(inputItems, checkoutMode, baseUrl) {
  if (!Array.isArray(inputItems) || inputItems.length === 0 || inputItems.length > 30) throw new Error('Carrinho inválido.');
  const catalog = new Map(DEFAULT_CONTENT.products.map((product) => [String(product.id), product]));

  return inputItems.map((input) => {
    const product = catalog.get(String(input.id));
    if (!product || !product.active) throw new Error('Um produto do carrinho não está mais disponível.');
    const quantity = Number.parseInt(input.quantity, 10);
    const stock = Math.max(0, Number(product.stock) || 0);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > stock) throw new Error(`Estoque insuficiente para ${product.name}.`);

    const model = validateVariant(product, 'models', input.model);
    const color = validateVariant(product, 'colors', input.color);
    const size = validateVariant(product, 'sizes', input.size);
    const unitPrice = parseBRL(product.price);
    if (unitPrice <= 0) throw new Error(`Preço inválido para ${product.name}.`);
    const details = [model, color, size].filter(Boolean).join(' • ');
    const imageUrl = product.image?.startsWith('http') ? product.image : `${baseUrl}${product.image}`;

    return {
      id: product.sku || product.id,
      title: details ? `${product.name} — ${details}`.slice(0, 120) : product.name.slice(0, 120),
      description: product.description?.slice(0, 250),
      picture_url: imageUrl,
      category_id: 'fashion',
      currency_id: 'BRL',
      quantity,
      unit_price: Number(unitPrice.toFixed(2))
    };
  });
}

export async function POST(request) {
  if (process.env.ENABLE_CHECKOUT !== 'true') {
    return NextResponse.json({ error: 'A compra online ainda não está disponível. Use o atendimento da Gataria pelo WhatsApp.' }, { status: 410 });
  }
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) return NextResponse.json({ error: 'O Mercado Pago ainda não foi configurado. Adicione o Access Token de teste nas variáveis do projeto.' }, { status: 503 });

  try {
    const body = await request.json();
    const checkoutMode = body.checkoutMode === 'standard' ? 'standard' : 'pix';
    const baseUrl = safeBaseUrl(request);
    const items = buildItems(body.items, checkoutMode, baseUrl);
    const externalReference = `GAT-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const preference = {
      items,
      external_reference: externalReference,
      statement_descriptor: 'GATARIA',
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        pending: `${baseUrl}/pagamento/pendente`,
        failure: `${baseUrl}/pagamento/falha`
      },
      auto_return: 'approved',
      metadata: { store: 'gataria', checkout_mode: checkoutMode },
      payment_methods: checkoutMode === 'pix' ? {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' },
          { id: 'atm' },
          { id: 'prepaid_card' }
        ],
        installments: 1
      } : { installments: 12 }
    };

    if (baseUrl.startsWith('https://')) preference.notification_url = `${baseUrl}/api/mercado-pago/webhook?source_news=webhooks`;

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': randomUUID()
      },
      body: JSON.stringify(preference),
      cache: 'no-store'
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('Mercado Pago recusou a preferência.', { status: response.status, cause: result?.cause?.map((item) => item.code) });
      return NextResponse.json({ error: 'O Mercado Pago não conseguiu preparar esta compra. Confira a configuração e tente novamente.' }, { status: 502 });
    }

    const testMode = accessToken.startsWith('TEST-');
    const checkoutUrl = testMode ? result.sandbox_init_point || result.init_point : result.init_point;
    if (!checkoutUrl) return NextResponse.json({ error: 'O Mercado Pago não devolveu o endereço do checkout.' }, { status: 502 });
    return NextResponse.json({ checkoutUrl, preferenceId: result.id, externalReference, testMode });
  } catch (error) {
    const message = error instanceof SyntaxError ? 'Dados do carrinho inválidos.' : error.message || 'Não foi possível iniciar o pagamento.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
