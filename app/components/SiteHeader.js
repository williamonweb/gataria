'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteContent } from '../content-context';
import { whatsappUrl } from '../../lib/whatsapp';

export default function SiteHeader() {
  const content = useSiteContent();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const whatsapp = whatsappUrl(content.contact);

  return <>
    {content.site.announcement && <div className="announcement">{content.site.announcement}</div>}
    <header className="siteHeader">
      <a className="brand" href="/" aria-label="Página inicial da Gataria">
        <img src="/assets/logo-transparent.png" alt="" />
        <span>{content.site.name}</span>
      </a>
      <button className="menuButton" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="gataria-navigation" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}>{menuOpen ? '×' : '☰'}</button>
      <nav id="gataria-navigation" onKeyDown={(event) => { if (event.key === 'Escape') setMenuOpen(false); }} className={menuOpen ? 'siteNav open' : 'siteNav'} aria-label="Navegação principal">
        {content.navigation.filter((item) => item.active).map((item) => <a className={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? 'active' : ''} href={item.href} key={item.id}>{item.label}</a>)}
      </nav>
      {whatsapp
        ? <a className="headerWhatsapp" href={whatsapp} target="_blank" rel="noreferrer">◉ WHATSAPP</a>
        : <a className="headerWhatsapp setup" href="/pagina/contato">CONTATO</a>}
    </header>
    <section className="ecommerceNotice" aria-label="Novidades da Gataria">
      <div className="shell"><span className="ecommerceNoticeIcon" aria-hidden="true">🛍️</span><div><strong>Em breve, a Gataria terá compra online!</strong><p>Estamos preparando nosso e-commerce. Por enquanto, escolha sua camiseta e faça seu pedido pelo WhatsApp.</p></div></div>
    </section>
  </>;
}
