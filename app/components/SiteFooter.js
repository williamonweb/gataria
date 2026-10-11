'use client';

import { useSiteContent } from '../content-context';
import { whatsappUrl } from '../../lib/whatsapp';

export default function SiteFooter() {
  const content = useSiteContent();
  const whatsapp = whatsappUrl(content.contact);
  return <footer id="rodape" className="footer catalogFooter">
    <div className="footerBrand">
      <a className="brand" href="/"><img src="/assets/logo-transparent.png" alt=""/><span>{content.site.name}</span></a>
      <p>{content.footer.description.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</p>
    </div>
    <div><h4>CATÁLOGO</h4><a href="/produtos">Todas as camisetas</a><a href="/colecoes">Coleções</a><a href="/pagina/sobre">Sobre a Gataria</a></div>
    <div><h4>ATENDIMENTO</h4>{whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer">◉ {content.contact.whatsapp}</a>}<a href={`mailto:${content.contact.email}`}>✉ {content.contact.email}</a><span className="footerText">⌖ {content.contact.hours}</span></div>
    <div><h4>REDES SOCIAIS</h4><a href={content.instagram.url || '#'} target="_blank" rel="noreferrer">Instagram {content.instagram.username}</a><a href="/pagina/privacidade">Política de privacidade</a></div>
    <div className="catalogNotice"><strong>CATÁLOGO ONLINE</strong><p>Escolha sua camiseta e fale diretamente com a Gataria. A compra pelo site será adicionada numa próxima etapa.</p></div>
    <p className="copyright">{content.footer.copyright}</p>
  </footer>;
}
