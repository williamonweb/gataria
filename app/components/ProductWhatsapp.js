'use client';

import { useRef } from 'react';
import { productWhatsappUrl, whatsappUrl } from '../../lib/whatsapp';
import { isSelectionAvailable } from '../../lib/product-availability';

export default function ProductWhatsapp({ contact, product, options = {}, className = 'productWhatsapp', children }) {
  const dialog = useRef(null);
  const url = productWhatsappUrl(contact, product, options);
  if (!url) return null;
  const available = isSelectionAvailable(product, options);
  const details = [
    `Olá! Quero ser avisado quando o produto ${product.name} estiver disponível novamente.`,
    product.sku ? `Código: ${product.sku}` : '',
    options.model ? `Modelo: ${options.model}` : '',
    options.color ? `Cor: ${options.color}` : '',
    options.size ? `Tamanho: ${options.size}` : '',
  ].filter(Boolean).join('\n');
  return <>
    <a className={className} href={url} target="_blank" rel="noreferrer" onClick={(event) => {
      if (!available) { event.preventDefault(); dialog.current.showModal(); }
    }}>{children || contact.whatsappLabel || 'FALAR NO WHATSAPP'}</a>
    {!available && <dialog ref={dialog} className="restockDialog" aria-labelledby={`restock-title-${product.id}`} onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <button className="restockClose" aria-label="Fechar" onClick={() => dialog.current.close()}>×</button>
      <span className="restockEyebrow">AVISO DE DISPONIBILIDADE</span>
      <h2 id={`restock-title-${product.id}`}>Produto indisponível</h2>
      <p><strong>{product.name}</strong> não está disponível no momento.</p>
      <p>Quer ser avisado quando chegar?</p>
      <a className="restockConfirm" href={whatsappUrl(contact, details)} target="_blank" rel="noreferrer" onClick={() => dialog.current.close()}>SIM, QUERO SER AVISADO</a>
      <button className="restockCancel" onClick={() => dialog.current.close()}>Agora não</button>
      <small>Envie a mensagem no WhatsApp para solicitar o aviso à Gataria.</small>
    </dialog>}
  </>;
}
