'use client';
import { use } from 'react';
import { useSiteContent } from '../../content-context';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { whatsappUrl } from '../../../lib/whatsapp';

export default function InstitutionalPage({ params }) {
  const { slug } = use(params);
  const content = useSiteContent();
  const page = content.pages[slug];
  if (!page) return <main><SiteHeader/><section className="notFound"><h1>Página não encontrada</h1><a href="/">Voltar para o início</a></section><SiteFooter/></main>;
  const whatsapp = whatsappUrl(content.contact);
  return <main><SiteHeader/><section className="institutionalHero"><div className="shell"><p>{page.eyebrow}</p><h1>{page.title}</h1></div></section><article className="institutionalContent shell"><p>{page.body}</p>{slug === 'contato' && <div className="contactCards">{whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer"><b>WHATSAPP</b><span>{content.contact.whatsapp}</span></a>}<a href={`mailto:${content.contact.email}`}><b>E-MAIL</b><span>{content.contact.email}</span></a><div><b>HORÁRIO</b><span>{content.contact.hours}</span></div></div>}</article><SiteFooter/></main>;
}
