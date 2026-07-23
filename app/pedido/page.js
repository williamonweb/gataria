'use client';

import { useEffect, useState } from 'react';

const ORDER_KEY = 'gataria-last-order-v1';

function numericPrice(value) {
  if (typeof value === 'number') return value;

  const text = String(value ?? '0').trim();

  if (text.includes(',')) {
    return Number(text.replace(/\./g, '').replace(',', '.')) || 0;
  }

  return Number(text) || 0;
}

function money(value) {
  return numericPrice(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function PedidoPage() {
  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORDER_KEY);
      if (saved) setOrder(JSON.parse(saved));
    } catch {}

    setLoaded(true);
  }, []);

  if (!loaded) {
    return <main className="orderPage"><div className="cartLoading">Carregando pedido...</div></main>;
  }

  if (!order) {
    return (
      <main className="orderPage">
        <header className="simpleHeader checkoutHeader">
          <a className="brand" href="/">
            <img src="/assets/logo-transparent.png" alt="Gataria"/>
            <span>GATARIA</span>
          </a>
        </header>

        <section className="emptyCartPage shell">
          <div className="emptyCartIcon">📦</div>
          <h2>Nenhum pedido encontrado</h2>
          <p>Comece escolhendo um produto da Gataria.</p>
          <a className="primaryButton" href="/produtos">VER PRODUTOS</a>
        </section>
      </main>
    );
  }

  const isPix = order.paymentDetails?.method === 'pix';
  const approved = order.status === 'PAGAMENTO_APROVADO';

  return (
    <main className="orderPage">
      <header className="simpleHeader checkoutHeader">
        <a className="brand" href="/">
          <img src="/assets/logo-transparent.png" alt="Gataria"/>
          <span>GATARIA</span>
        </a>
        <span className="checkoutSecure">🔒 Pedido registrado com segurança</span>
      </header>

      <section className="orderSuccessHero">
        <div className="orderSuccessIcon">{approved ? '✓' : '!'}</div>
        <p>{approved ? 'COMPRA CONCLUÍDA' : 'PEDIDO RECEBIDO'}</p>
        <h1>{approved ? 'PAGAMENTO APROVADO!' : 'AGUARDANDO PAGAMENTO'}</h1>
        <span>
          {approved
            ? 'Seu pedido foi confirmado e já entrou em nossa fila de preparação.'
            : 'Recebemos seu pedido. Ele será confirmado assim que o PIX for identificado.'}
        </span>
      </section>

      <section className="orderLayout shell">
        <div className="orderMain">
          <section className="orderNumberCard">
            <small>NÚMERO DO PEDIDO</small>
            <strong>{order.orderNumber}</strong>
            <span>Realizado em {formatDate(order.createdAt)}</span>
          </section>

          <section className="orderStatusCard">
            <h2>Acompanhe seu pedido</h2>
            <div className="orderTimeline">
              <div className="active">
                <i>✓</i>
                <span><strong>Pedido recebido</strong><small>Cadastro concluído</small></span>
              </div>
              <div className={approved ? 'active' : ''}>
                <i>{approved ? '✓' : '2'}</i>
                <span><strong>Pagamento</strong><small>{approved ? 'Pagamento aprovado' : 'Aguardando confirmação'}</small></span>
              </div>
              <div>
                <i>3</i>
                <span><strong>Preparação</strong><small>Separação e produção</small></span>
              </div>
              <div>
                <i>4</i>
                <span><strong>Envio</strong><small>Código de rastreio</small></span>
              </div>
            </div>
          </section>

          <section className="orderDetailsCard">
            <div>
              <small>ENTREGA</small>
              <h3>{order.customer.name}</h3>
              <p>{order.customer.street}, {order.customer.number}{order.customer.complement ? ` — ${order.customer.complement}` : ''}</p>
              <p>{order.customer.district} — {order.customer.city}/{order.customer.state}</p>
              <p>CEP {order.customer.cep}</p>
            </div>

            <div>
              <small>CONTATO</small>
              <h3>{order.customer.email}</h3>
              <p>{order.customer.phone}</p>
              <p>CPF {order.customer.cpf}</p>
            </div>

            <div>
              <small>PAGAMENTO</small>
              <h3>{isPix ? 'PIX' : 'Cartão de crédito'}</h3>
              <p>{approved ? 'Pagamento aprovado' : 'Aguardando pagamento'}</p>
              {!isPix && <p>{order.paymentDetails.installments}x sem juros</p>}
            </div>
          </section>
        </div>

        <aside className="orderSummary">
          <small>RESUMO</small>
          <h2>Seu pedido</h2>

          <div className="orderProducts">
            {order.cart.map((item) => (
              <article key={item.key}>
                <img src={item.image} alt={item.name}/>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.quantity}x • {[item.model, item.color, item.size].filter(Boolean).join(' • ')}</span>
                </div>
                <b>{money(numericPrice(item.price) * Number(item.quantity || 1))}</b>
              </article>
            ))}
          </div>

          <div className="orderTotals">
            <div><span>Subtotal</span><strong>{money(order.totals.subtotal)}</strong></div>
            <div><span>Entrega</span><strong>{numericPrice(order.totals.shipping) === 0 ? 'GRÁTIS' : money(order.totals.shipping)}</strong></div>
            {numericPrice(order.totals.pixDiscount) > 0 && (
              <div className="orderDiscount">
                <span>Desconto PIX</span>
                <strong>− {money(order.totals.pixDiscount)}</strong>
              </div>
            )}
          </div>

          <div className="orderGrandTotal">
            <span>TOTAL</span>
            <strong>{money(order.totals.total)}</strong>
          </div>

          <a className="orderPrimaryButton" href="/produtos">CONTINUAR COMPRANDO</a>
          <a
            className="orderWhatsappButton"
            href={`https://wa.me/?text=${encodeURIComponent(`Olá! Gostaria de falar sobre o pedido ${order.orderNumber}.`)}`}
            target="_blank"
            rel="noreferrer"
          >
            FALAR SOBRE O PEDIDO
          </a>
        </aside>
      </section>
    </main>
  );
}
