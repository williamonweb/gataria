'use client';

import { useCart } from '../cart-context';

export default function CartBadge({ compact = false }) {
  const { count } = useCart();

  if (compact) {
    return <a className="simpleCart" href="/carrinho" aria-label={`Carrinho com ${count} item(ns)`}>🛒 CARRINHO <b>{count}</b></a>;
  }

  return (
    <a className="headerAction cart" href="/carrinho" aria-label={`Carrinho com ${count} item(ns)`}>
      🛒
      {count > 0 && <i>{count}</i>}
      <small>CARRINHO</small>
    </a>
  );
}
