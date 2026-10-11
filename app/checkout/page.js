'use client';

import { useEffect, useMemo, useState } from 'react';

const CART_KEY = 'gataria-cart-v1';
const CHECKOUT_KEY = 'gataria-checkout-v1';
const FREE_SHIPPING_TARGET = 199;

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

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCep(value) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [payment, setPayment] = useState('pix');
  const [shipping, setShipping] = useState('economico');
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    note: '',
  });

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const savedCheckout = localStorage.getItem(CHECKOUT_KEY);

      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedCheckout) {
        const parsed = JSON.parse(savedCheckout);
        setForm((current) => ({ ...current, ...(parsed.form || {}) }));
        setPayment(parsed.payment || 'pix');
        setShipping(parsed.shipping || 'economico');
      }
    } catch {}

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(CHECKOUT_KEY, JSON.stringify({
      form,
      payment,
      shipping,
    }));
  }, [form, payment, shipping, loaded]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__gatariaCheckoutToast);
    window.__gatariaCheckoutToast = window.setTimeout(() => setToast(''), 2800);
  }

  function continueCheckout(event) {
    event.preventDefault();

    const required = [
      ['name', 'Informe seu nome completo.'],
      ['email', 'Informe seu e-mail.'],
      ['cpf', 'Informe seu CPF.'],
      ['phone', 'Informe seu telefone.'],
      ['cep', 'Informe seu CEP.'],
      ['street', 'Informe sua rua.'],
      ['number', 'Informe o número.'],
      ['district', 'Informe seu bairro.'],
      ['city', 'Informe sua cidade.'],
      ['state', 'Informe seu estado.'],
    ];

    for (const [field, message] of required) {
      if (!String(form[field] || '').trim()) {
        showToast(message);
        document.querySelector(`[name="${field}"]`)?.focus();
        return;
      }
    }

    if (!form.email.includes('@')) {
      showToast('Informe um e-mail válido.');
      return;
    }

    if (onlyDigits(form.cpf).length !== 11) {
      showToast('Informe um CPF válido com 11 números.');
      return;
    }

    if (onlyDigits(form.phone).length < 10) {
      showToast('Informe um telefone válido.');
      return;
    }

    if (onlyDigits(form.cep).length !== 8) {
      showToast('Informe um CEP válido.');
      return;
    }

    const orderDraft = {
      customer: form,
      payment,
      shipping,
      cart,
      totals: {
        subtotal,
        shipping: shippingPrice,
        pixDiscount,
        total,
      },
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('gataria-order-draft-v1', JSON.stringify(orderDraft));
    window.location.href = '/pagamento';
  }

  const subtotal = useMemo(
    () => cart.reduce(
      (sum, item) => sum + numericPrice(item.price) * Number(item.quantity || 1),
      0,
    ),
    [cart],
  );

  const shippingOptions = {
    economico: {
      label: 'Envio econômico',
      deadline: '5 a 9 dias úteis',
      price: subtotal >= FREE_SHIPPING_TARGET ? 0 : 18.9,
    },
    expresso: {
      label: 'Envio expresso',
      deadline: '2 a 4 dias úteis',
      price: 29.9,
    },
  };

  const selectedShipping = shippingOptions[shipping];
  const shippingPrice = selectedShipping.price;
  const pixDiscount = 0;
  const total = Math.max(0, subtotal + shippingPrice - pixDiscount);
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  if (!loaded) {
    return <main className="checkoutPage"><div className="cartLoading">Carregando checkout...</div></main>;
  }

  if (cart.length === 0) {
    return (
      <main className="checkoutPage">
        <header className="simpleHeader checkoutHeader">
          <a className="brand" href="/">
            <img src="/assets/logo-transparent.png" alt="Gataria"/>
            <span>GATARIA</span>
          </a>
        </header>

        <section className="emptyCartPage shell">
          <div className="emptyCartIcon">🛒</div>
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione produtos antes de iniciar o checkout.</p>
          <a className="primaryButton" href="/produtos">VER PRODUTOS</a>
        </section>
      </main>
    );
  }

  return (
    <main className="checkoutPage">
      <header className="simpleHeader checkoutHeader">
        <a className="brand" href="/">
          <img src="/assets/logo-transparent.png" alt="Gataria"/>
          <span>GATARIA</span>
        </a>

        <div className="checkoutSteps" aria-label="Etapas da compra">
          <span className="done">1. Carrinho</span>
          <i/>
          <span className="active">2. Checkout</span>
          <i/>
          <span>3. Pagamento</span>
        </div>

        <span className="checkoutSecure">🔒 Ambiente seguro</span>
      </header>

      <section className="checkoutHero">
        <div className="shell">
          <p>FINALIZE SEU PEDIDO</p>
          <h1>CHECKOUT</h1>
          <span>Preencha seus dados e escolha a forma de envio e pagamento.</span>
        </div>
      </section>

      <form className="checkoutLayout shell" onSubmit={continueCheckout}>
        <div className="checkoutMain">
          <section className="checkoutSection">
            <div className="checkoutSectionTitle">
              <span>1</span>
              <div>
                <small>IDENTIFICAÇÃO</small>
                <h2>Seus dados</h2>
              </div>
            </div>

            <div className="checkoutFields twoColumns">
              <label className="fullField">
                <span>Nome completo *</span>
                <input
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Digite seu nome completo"
                />
              </label>

              <label>
                <span>E-mail *</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="voce@email.com"
                />
              </label>

              <label>
                <span>CPF *</span>
                <input
                  name="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.cpf}
                  onChange={(event) => updateField('cpf', formatCpf(event.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </label>

              <label>
                <span>Telefone / WhatsApp *</span>
                <input
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', formatPhone(event.target.value))}
                  placeholder="(51) 99999-9999"
                  maxLength={15}
                />
              </label>
            </div>
          </section>

          <section className="checkoutSection">
            <div className="checkoutSectionTitle">
              <span>2</span>
              <div>
                <small>ENTREGA</small>
                <h2>Endereço</h2>
              </div>
            </div>

            <div className="checkoutFields addressGrid">
              <label>
                <span>CEP *</span>
                <input
                  name="cep"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={form.cep}
                  onChange={(event) => updateField('cep', formatCep(event.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </label>

              <label className="streetField">
                <span>Rua / Avenida *</span>
                <input
                  name="street"
                  autoComplete="address-line1"
                  value={form.street}
                  onChange={(event) => updateField('street', event.target.value)}
                  placeholder="Nome da rua"
                />
              </label>

              <label>
                <span>Número *</span>
                <input
                  name="number"
                  inputMode="numeric"
                  value={form.number}
                  onChange={(event) => updateField('number', event.target.value)}
                  placeholder="123"
                />
              </label>

              <label>
                <span>Complemento</span>
                <input
                  name="complement"
                  autoComplete="address-line2"
                  value={form.complement}
                  onChange={(event) => updateField('complement', event.target.value)}
                  placeholder="Casa, apto, bloco..."
                />
              </label>

              <label>
                <span>Bairro *</span>
                <input
                  name="district"
                  value={form.district}
                  onChange={(event) => updateField('district', event.target.value)}
                  placeholder="Seu bairro"
                />
              </label>

              <label>
                <span>Cidade *</span>
                <input
                  name="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Sua cidade"
                />
              </label>

              <label>
                <span>Estado *</span>
                <select
                  name="state"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value)}
                >
                  <option value="">Selecione</option>
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
                    .map((state) => <option value={state} key={state}>{state}</option>)}
                </select>
              </label>
            </div>

            <label className="checkoutCheck">
              <input
                type="checkbox"
                checked={sameBillingAddress}
                onChange={(event) => setSameBillingAddress(event.target.checked)}
              />
              <span>Usar este endereço também para cobrança</span>
            </label>
          </section>

          <section className="checkoutSection">
            <div className="checkoutSectionTitle">
              <span>3</span>
              <div>
                <small>FORMA DE ENVIO</small>
                <h2>Escolha a entrega</h2>
              </div>
            </div>

            <div className="shippingOptions">
              {Object.entries(shippingOptions).map(([key, option]) => (
                <label className={`shippingOption ${shipping === key ? 'selected' : ''}`} key={key}>
                  <input
                    type="radio"
                    name="shipping"
                    value={key}
                    checked={shipping === key}
                    onChange={() => setShipping(key)}
                  />
                  <span className="shippingRadio"/>
                  <div>
                    <strong>{option.label}</strong>
                    <small>{option.deadline}</small>
                  </div>
                  <b>{option.price === 0 ? 'GRÁTIS' : money(option.price)}</b>
                </label>
              ))}
            </div>
          </section>

          <section className="checkoutSection">
            <div className="checkoutSectionTitle">
              <span>4</span>
              <div>
                <small>PAGAMENTO</small>
                <h2>Como você prefere pagar?</h2>
              </div>
            </div>

            <div className="paymentOptions">
              <label className={`paymentOption ${payment === 'pix' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={payment === 'pix'}
                  onChange={() => setPayment('pix')}
                />
                <span className="paymentIcon">◆</span>
                <div>
                  <strong>PIX</strong>
                  <small>Pagamento via PIX.</small>
                </div>
                
              </label>

              <label className={`paymentOption ${payment === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={payment === 'card'}
                  onChange={() => setPayment('card')}
                />
                <span className="paymentIcon">▣</span>
                <div>
                  <strong>Cartão de crédito</strong>
                  <small>Parcele em até 3x sem juros.</small>
                </div>
              </label>
            </div>
          </section>

          <section className="checkoutSection">
            <div className="checkoutSectionTitle">
              <span>5</span>
              <div>
                <small>OBSERVAÇÕES</small>
                <h2>Algum recado?</h2>
              </div>
            </div>

            <label className="checkoutTextarea">
              <textarea
                name="note"
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder="Ex.: instruções para entrega ou observações sobre o pedido."
                maxLength={500}
              />
              <small>{form.note.length}/500</small>
            </label>
          </section>
        </div>

        <aside className="checkoutSummary">
          <div className="checkoutSummaryHeader">
            <div>
              <small>RESUMO DO PEDIDO</small>
              <h2>{totalItems} {totalItems === 1 ? 'ITEM' : 'ITENS'}</h2>
            </div>
            <a href="/carrinho">Editar</a>
          </div>

          <div className="checkoutProducts">
            {cart.map((item) => (
              <article key={item.key}>
                <div className="checkoutProductImage">
                  <img src={item.image} alt={item.name}/>
                  <i>{item.quantity}</i>
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <span>{[item.model, item.color, item.size].filter(Boolean).join(' • ')}</span>
                </div>
                <b>{money(numericPrice(item.price) * Number(item.quantity || 1))}</b>
              </article>
            ))}
          </div>

          <div className="checkoutTotals">
            <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div><span>Entrega</span><strong>{shippingPrice === 0 ? 'GRÁTIS' : money(shippingPrice)}</strong></div>
            {pixDiscount > 0 && (
              <div className="checkoutDiscount">
                <span>Desconto PIX</span>
                <strong>− {money(pixDiscount)}</strong>
              </div>
            )}
          </div>

          <div className="checkoutGrandTotal">
            <span>TOTAL</span>
            <strong>{money(total)}</strong>
            <small>
              {payment === 'pix'
                ? 'Pagamento via PIX'
                : `ou 3x de ${money(total / 3)} sem juros`}
            </small>
          </div>

          <button className="checkoutSubmit" type="submit">
            CONTINUAR PARA PAGAMENTO
          </button>

          <p className="checkoutLegal">
            Ao continuar, você confirma que os dados estão corretos e aceita os termos da loja.
          </p>

          <div className="checkoutTrust">
            <span>🔒 Dados protegidos</span>
            <span>↻ Troca facilitada</span>
            <span>🚚 Envio para todo o Brasil</span>
          </div>
        </aside>
      </form>

      {toast && <div className="productToast">{toast}</div>}
    </main>
  );
}
