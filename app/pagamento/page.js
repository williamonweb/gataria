'use client';

import { useEffect, useMemo, useState } from 'react';

const CART_KEY = 'gataria-cart-v1';
const ORDER_DRAFT_KEY = 'gataria-order-draft-v1';
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

function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function formatCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function createOrderNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear().toString().slice(-2),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');

  const random = Math.floor(1000 + Math.random() * 9000);
  return `GAT-${stamp}-${random}`;
}

function makePixCode(orderNumber, total) {
  const cents = Math.round(numericPrice(total) * 100);
  return `00020126580014BR.GOV.BCB.PIX0136gataria-${orderNumber.toLowerCase()}520400005303986540${cents}5802BR5913GATARIA STORE6009GRAVATAI62070503***6304ABCD`;
}

export default function PagamentoPage() {
  const [draft, setDraft] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    installments: '1',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORDER_DRAFT_KEY);
      if (saved) setDraft(JSON.parse(saved));
    } catch {}

    setLoaded(true);
  }, []);

  const orderNumber = useMemo(() => draft?.orderNumber || createOrderNumber(), [draft]);
  const total = numericPrice(draft?.totals?.total);
  const pixCode = useMemo(() => makePixCode(orderNumber, total), [orderNumber, total]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__gatariaPaymentToast);
    window.__gatariaPaymentToast = window.setTimeout(() => setToast(''), 2800);
  }

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      showToast('Código PIX copiado.');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      showToast('Não foi possível copiar automaticamente.');
    }
  }

  function validateCard() {
    if (!card.name.trim()) return 'Informe o nome impresso no cartão.';
    if (onlyDigits(card.number).length !== 16) return 'Informe um número de cartão válido.';
    if (onlyDigits(card.expiry).length !== 4) return 'Informe a validade do cartão.';
    if (onlyDigits(card.cvv).length < 3) return 'Informe o código de segurança.';
    return '';
  }

  function completeOrder() {
    if (!draft) return;

    if (draft.payment === 'card') {
      const error = validateCard();
      if (error) {
        showToast(error);
        return;
      }
    }

    setProcessing(true);

    window.setTimeout(() => {
      const completedOrder = {
        ...draft,
        orderNumber,
        status: draft.payment === 'pix' ? 'AGUARDANDO_PAGAMENTO' : 'PAGAMENTO_APROVADO',
        paymentDetails: {
          method: draft.payment,
          installments: draft.payment === 'card' ? Number(card.installments) : 1,
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(ORDER_KEY, JSON.stringify(completedOrder));
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(ORDER_DRAFT_KEY);
      window.location.href = '/pedido';
    }, 1100);
  }

  if (!loaded) {
    return <main className="paymentPage"><div className="cartLoading">Carregando pagamento...</div></main>;
  }

  if (!draft) {
    return (
      <main className="paymentPage">
        <header className="simpleHeader checkoutHeader">
          <a className="brand" href="/">
            <img src="/assets/logo-transparent.png" alt="Gataria"/>
            <span>GATARIA</span>
          </a>
        </header>

        <section className="emptyCartPage shell">
          <div className="emptyCartIcon">!</div>
          <h2>Pedido não encontrado</h2>
          <p>Volte ao carrinho e refaça o checkout.</p>
          <a className="primaryButton" href="/carrinho">VOLTAR AO CARRINHO</a>
        </section>
      </main>
    );
  }

  return (
    <main className="paymentPage">
      <header className="simpleHeader checkoutHeader">
        <a className="brand" href="/">
          <img src="/assets/logo-transparent.png" alt="Gataria"/>
          <span>GATARIA</span>
        </a>

        <div className="checkoutSteps">
          <span className="done">1. Carrinho</span>
          <i/>
          <span className="done">2. Checkout</span>
          <i/>
          <span className="active">3. Pagamento</span>
        </div>

        <span className="checkoutSecure">🔒 Ambiente seguro</span>
      </header>

      <section className="paymentHero">
        <div className="shell">
          <p>PEDIDO {orderNumber}</p>
          <h1>PAGAMENTO</h1>
          <span>Revise os dados e conclua sua compra.</span>
        </div>
      </section>

      <section className="paymentLayout shell">
        <div className="paymentMain">
          {draft.payment === 'pix' ? (
            <section className="paymentMethodCard">
              <div className="paymentMethodTitle">
                <span className="paymentMethodIcon">◆</span>
                <div>
                  <small>PAGAMENTO VIA PIX</small>
                  <h2>Escaneie ou copie o código</h2>
                </div>
              </div>

              <div className="pixPaymentContent">
                <div className="pixQrMock" aria-label="QR Code demonstrativo">
                  <div className="qrPattern"/>
                  <span>PIX</span>
                </div>

                <div className="pixInstructions">
                  <ol>
                    <li>Abra o aplicativo do seu banco.</li>
                    <li>Escolha a opção PIX Copia e Cola.</li>
                    <li>Cole o código e confirme o valor.</li>
                  </ol>

                  <div className="pixCodeBox">
                    <span>{pixCode}</span>
                    <button type="button" onClick={copyPixCode}>
                      {copied ? 'COPIADO' : 'COPIAR CÓDIGO'}
                    </button>
                  </div>

                  <div className="pixWarning">
                    <strong>Valor: {money(total)}</strong>
                    <span>O pedido ficará aguardando pagamento até a confirmação.</span>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="paymentMethodCard">
              <div className="paymentMethodTitle">
                <span className="paymentMethodIcon">▣</span>
                <div>
                  <small>CARTÃO DE CRÉDITO</small>
                  <h2>Dados do cartão</h2>
                </div>
              </div>

              <div className="cardPaymentFields">
                <label className="fullField">
                  <span>Nome impresso no cartão</span>
                  <input
                    value={card.name}
                    onChange={(event) => setCard((current) => ({ ...current, name: event.target.value.toUpperCase() }))}
                    placeholder="NOME COMPLETO"
                    autoComplete="cc-name"
                  />
                </label>

                <label className="fullField">
                  <span>Número do cartão</span>
                  <input
                    inputMode="numeric"
                    value={card.number}
                    onChange={(event) => setCard((current) => ({ ...current, number: formatCardNumber(event.target.value) }))}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    autoComplete="cc-number"
                  />
                </label>

                <label>
                  <span>Validade</span>
                  <input
                    inputMode="numeric"
                    value={card.expiry}
                    onChange={(event) => setCard((current) => ({ ...current, expiry: formatExpiry(event.target.value) }))}
                    placeholder="MM/AA"
                    maxLength={5}
                    autoComplete="cc-exp"
                  />
                </label>

                <label>
                  <span>CVV</span>
                  <input
                    inputMode="numeric"
                    value={card.cvv}
                    onChange={(event) => setCard((current) => ({ ...current, cvv: onlyDigits(event.target.value).slice(0, 4) }))}
                    placeholder="123"
                    maxLength={4}
                    autoComplete="cc-csc"
                  />
                </label>

                <label className="fullField">
                  <span>Parcelamento</span>
                  <select
                    value={card.installments}
                    onChange={(event) => setCard((current) => ({ ...current, installments: event.target.value }))}
                  >
                    <option value="1">1x de {money(total)} sem juros</option>
                    <option value="2">2x de {money(total / 2)} sem juros</option>
                    <option value="3">3x de {money(total / 3)} sem juros</option>
                  </select>
                </label>
              </div>
            </section>
          )}

          <section className="paymentAddressCard">
            <div>
              <small>ENTREGA</small>
              <h3>{draft.customer.name}</h3>
              <p>
                {draft.customer.street}, {draft.customer.number}
                {draft.customer.complement ? ` — ${draft.customer.complement}` : ''}
              </p>
              <p>{draft.customer.district} — {draft.customer.city}/{draft.customer.state}</p>
              <p>CEP {draft.customer.cep}</p>
            </div>
            <a href="/checkout">Editar dados</a>
          </section>
        </div>

        <aside className="paymentSummary">
          <small>RESUMO DO PEDIDO</small>
          <h2>{orderNumber}</h2>

          <div className="paymentProducts">
            {draft.cart.map((item) => (
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

          <div className="paymentTotals">
            <div><span>Subtotal</span><strong>{money(draft.totals.subtotal)}</strong></div>
            <div><span>Entrega</span><strong>{numericPrice(draft.totals.shipping) === 0 ? 'GRÁTIS' : money(draft.totals.shipping)}</strong></div>
            {numericPrice(draft.totals.pixDiscount) > 0 && (
              <div className="paymentDiscount">
                <span>Desconto PIX</span>
                <strong>− {money(draft.totals.pixDiscount)}</strong>
              </div>
            )}
          </div>

          <div className="paymentGrandTotal">
            <span>TOTAL</span>
            <strong>{money(total)}</strong>
          </div>

          <button
            className="paymentConfirmButton"
            type="button"
            disabled={processing}
            onClick={completeOrder}
          >
            {processing
              ? 'PROCESSANDO...'
              : draft.payment === 'pix'
                ? 'JÁ FIZ O PAGAMENTO'
                : 'PAGAR E FINALIZAR'}
          </button>

          <a className="paymentBackButton" href="/checkout">VOLTAR AO CHECKOUT</a>

          <div className="paymentSecurity">
            <span>🔒 Pagamento protegido</span>
            <span>Seus dados não ficam armazenados</span>
          </div>
        </aside>
      </section>

      {toast && <div className="productToast">{toast}</div>}
    </main>
  );
}
