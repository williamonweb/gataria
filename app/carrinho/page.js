'use client';

import { useEffect, useMemo, useState } from 'react';

const CART_KEY = 'gataria-cart-v1';
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

function formatCep(value) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function CarrinhoPage() {
  const [cart, setCart] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [cep, setCep] = useState('');
  const [shipping, setShipping] = useState(null);
  const [shippingMessage, setShippingMessage] = useState('');
  const [toast, setToast] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {}

    setLoaded(true);
  }, []);

  function persistCart(nextCart) {
    setCart(nextCart);
    localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
  }

  function changeQty(key, delta) {
    const nextCart = cart.map((item) => {
      if (item.key !== key) return item;

      const maximum = Math.max(1, Number(item.stock || 99));
      return {
        ...item,
        quantity: Math.max(1, Math.min(maximum, Number(item.quantity || 1) + delta)),
      };
    });

    persistCart(nextCart);
  }

  function removeItem(key) {
    persistCart(cart.filter((item) => item.key !== key));
    showToast('Produto removido do carrinho.');
  }

  function clearCart() {
    persistCart([]);
    setCoupon(null);
    setShipping(null);
    setShippingMessage('');
    showToast('Carrinho esvaziado.');
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__gatariaCartToast);
    window.__gatariaCartToast = window.setTimeout(() => setToast(''), 2600);
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      showToast('Digite um cupom.');
      return;
    }

    const availableCoupons = {
      GATARIA10: { code: 'GATARIA10', label: '10% de desconto', type: 'percent', value: 10 },
      PRIMEIRACOMPRA: { code: 'PRIMEIRACOMPRA', label: 'R$ 15,00 de desconto', type: 'fixed', value: 15 },
    };

    const selectedCoupon = availableCoupons[code];

    if (!selectedCoupon) {
      setCoupon(null);
      showToast('Cupom inválido ou expirado.');
      return;
    }

    setCoupon(selectedCoupon);
    showToast(`Cupom ${selectedCoupon.code} aplicado.`);
  }

  function calculateShipping() {
    const digits = onlyDigits(cep);

    if (digits.length !== 8) {
      setShipping(null);
      setShippingMessage('Digite um CEP válido com 8 números.');
      return;
    }

    const region = Number(digits[0]);
    const amount = region <= 2 ? 14.9 : region <= 5 ? 19.9 : 24.9;
    const days = region <= 2 ? '3 a 5 dias úteis' : region <= 5 ? '5 a 8 dias úteis' : '7 a 11 dias úteis';

    setShipping({ amount, days });
    setShippingMessage('Estimativa inicial de entrega.');
  }

  const subtotal = useMemo(
    () => cart.reduce(
      (sum, item) => sum + numericPrice(item.price) * Number(item.quantity || 1),
      0,
    ),
    [cart],
  );

  const couponDiscount = useMemo(() => {
    if (!coupon) return 0;

    if (coupon.type === 'percent') {
      return subtotal * (coupon.value / 100);
    }

    return Math.min(subtotal, coupon.value);
  }, [coupon, subtotal]);

  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const pixDiscount = subtotalAfterCoupon * 0.05;
  const shippingValue = subtotalAfterCoupon >= FREE_SHIPPING_TARGET ? 0 : numericPrice(shipping?.amount);
  const totalCard = subtotalAfterCoupon + shippingValue;
  const totalPix = Math.max(0, subtotalAfterCoupon - pixDiscount + shippingValue);
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_TARGET - subtotalAfterCoupon);
  const progress = Math.min(100, (subtotalAfterCoupon / FREE_SHIPPING_TARGET) * 100);
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  if (!loaded) {
    return <main className="cartPage"><div className="cartLoading">Carregando carrinho...</div></main>;
  }

  return (
    <main className="cartPage">
      <header className="simpleHeader cartPageHeader">
        <a className="brand" href="/">
          <img src="/assets/logo-transparent.png" alt="Gataria"/>
          <span>GATARIA</span>
        </a>

        <nav>
          <a href="/">HOME</a>
          <a href="/produtos">PRODUTOS</a>
          <a className="active" href="/carrinho">CARRINHO</a>
        </nav>

        <a className="cartBackLink" href="/produtos">← Continuar comprando</a>
      </header>

      <section className="cartHero">
        <div className="shell">
          <p>SEU PEDIDO</p>
          <h1>CARRINHO</h1>
          <span>{totalItems} {totalItems === 1 ? 'item selecionado' : 'itens selecionados'}</span>
        </div>
      </section>

      {cart.length === 0 ? (
        <section className="emptyCartPage shell">
          <div className="emptyCartIcon">🛒</div>
          <h2>Seu carrinho está vazio</h2>
          <p>Escolha sua próxima camiseta e vista sua atitude.</p>
          <a className="primaryButton" href="/produtos">VER PRODUTOS</a>
        </section>
      ) : (
        <section className="cartLayout shell">
          <div className="cartMain">
            <div className="freeShippingCard">
              <div className="freeShippingText">
                <strong>
                  {missingForFreeShipping > 0
                    ? `Faltam ${money(missingForFreeShipping)} para ganhar frete grátis`
                    : 'Você ganhou frete grátis!'}
                </strong>
                <span>Frete grátis em compras a partir de {money(FREE_SHIPPING_TARGET)}.</span>
              </div>
              <div className="freeShippingTrack">
                <i style={{ width: `${progress}%` }}/>
              </div>
            </div>

            <div className="cartItemsPanel">
              <div className="cartPanelTitle">
                <div>
                  <small>PRODUTOS</small>
                  <h2>Revise seu carrinho</h2>
                </div>
                <button type="button" onClick={clearCart}>Esvaziar carrinho</button>
              </div>

              {cart.map((item) => (
                <article className="cartPageItem" key={item.key}>
                  <a className="cartItemImage" href={`/produto/${item.slug || item.id}`}>
                    <img src={item.image} alt={item.name}/>
                  </a>

                  <div className="cartItemInfo">
                    <small>GATARIA</small>
                    <a href={`/produto/${item.slug || item.id}`}><h3>{item.name}</h3></a>
                    <p>{[item.model, item.color, item.size].filter(Boolean).join(' • ') || 'Modelo padrão'}</p>
                    <button className="cartRemoveMobile" type="button" onClick={() => removeItem(item.key)}>
                      Remover
                    </button>
                  </div>

                  <div className="cartItemQty">
                    <label>QUANTIDADE</label>
                    <div>
                      <button type="button" onClick={() => changeQty(item.key, -1)}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => changeQty(item.key, 1)}>+</button>
                    </div>
                  </div>

                  <div className="cartItemPrice">
                    <small>PREÇO</small>
                    <strong>{money(numericPrice(item.price) * Number(item.quantity || 1))}</strong>
                    <span>{money(item.price)} cada</span>
                    <button type="button" onClick={() => removeItem(item.key)}>Remover</button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cartTools">
              <section className="cartToolCard">
                <small>CUPOM</small>
                <h3>Tem um cupom?</h3>
                <p>Digite o código para aplicar seu desconto.</p>
                <div className="cartInputRow">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="Ex.: GATARIA10"
                    maxLength={30}
                  />
                  <button type="button" onClick={applyCoupon}>APLICAR</button>
                </div>
                {coupon && (
                  <div className="appliedCoupon">
                    <span>✓ {coupon.code} — {coupon.label}</span>
                    <button type="button" onClick={() => setCoupon(null)}>Remover</button>
                  </div>
                )}
              </section>

              <section className="cartToolCard">
                <small>ENTREGA</small>
                <h3>Calcule o frete</h3>
                <p>Informe seu CEP para ver uma estimativa.</p>
                <div className="cartInputRow">
                  <input
                    inputMode="numeric"
                    value={cep}
                    onChange={(event) => setCep(formatCep(event.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  <button type="button" onClick={calculateShipping}>CALCULAR</button>
                </div>
                {shippingMessage && (
                  <div className={`shippingResult ${shipping ? 'success' : 'error'}`}>
                    <strong>{shipping ? (shippingValue === 0 ? 'Frete grátis' : money(shipping.amount)) : shippingMessage}</strong>
                    {shipping && <span>{shipping.days} — {shippingMessage}</span>}
                  </div>
                )}
              </section>
            </div>
          </div>

          <aside className="cartSummary">
            <small>RESUMO</small>
            <h2>Seu pedido</h2>

            <div className="summaryRows">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              {couponDiscount > 0 && <div className="summaryDiscount"><span>Cupom</span><strong>− {money(couponDiscount)}</strong></div>}
              <div><span>Frete</span><strong>{shipping ? (shippingValue === 0 ? 'GRÁTIS' : money(shippingValue)) : 'A calcular'}</strong></div>
            </div>

            <div className="summaryTotal">
              <span>Total no cartão</span>
              <strong>{money(totalCard)}</strong>
              <small>ou em até 3x de {money(totalCard / 3)} sem juros</small>
            </div>

            <div className="pixHighlight">
              <span>VALOR NO PIX</span>
              <strong>{money(totalPix)}</strong>
              <small>5% de desconto no pagamento via PIX</small>
            </div>

            <a className="cartCheckoutButton" href="/checkout">
              IR PARA O CHECKOUT
            </a>

            <a className="cartContinueButton" href="/produtos">
              CONTINUAR COMPRANDO
            </a>

            <div className="cartSecurity">
              <span>🔒 Compra segura</span>
              <span>↻ Troca facilitada</span>
              <span>🚚 Envio para todo o Brasil</span>
            </div>
          </aside>
        </section>
      )}

      {toast && <div className="productToast">{toast}</div>}
    </main>
  );
}
