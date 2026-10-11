'use client';

import { useSiteContent } from './content-context';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import ProductCard from './components/ProductCard';
import { productWhatsappUrl, whatsappUrl } from '../lib/whatsapp';

export default function Home() {
  const content = useSiteContent();
  const products = content.products.filter((item) => item.active && item.featured !== false).slice(0, 4);
  const collections = content.collections.filter((item) => item.active && item.featured !== false).slice(0, 4);
  const featuredProduct = content.products.find((item) => item.id === content.featured.productId && item.active) || products[0];
  const generalWhatsapp = whatsappUrl(content.contact);
  const featuredWhatsapp = productWhatsappUrl(content.contact, featuredProduct);

  return <main>
    <SiteHeader/>

    {content.hero.active && <section id="inicio" className="hero" style={{ backgroundImage: `url(${content.hero.image})` }}>
      <div className="heroOverlay"/>
      <div className="heroContent">
        <p className="eyebrow">{content.hero.eyebrow}</p>
        <h1>{content.hero.title.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}<br/></span>)}</h1>
        <p className="heroTagline">{content.hero.tagline}</p>
        <a className="primaryButton" href={content.hero.buttonHref || '/produtos'}>{content.hero.buttonText}</a>
      </div>
      <div className="heroLightning one">ϟ</div><div className="heroLightning two">ϟ</div>
    </section>}

    <section className="categoryBar" aria-label="Categorias">
      {content.categories.filter((item) => item.active).map((item) => <a key={item.id} href={`/produtos${item.query ? `?categoria=${encodeURIComponent(item.query)}` : ''}`}><b>{item.icon}</b><span>{item.label}</span></a>)}
    </section>

    <section className="section shell">
      <div className="sectionTitle"><div><small>ESCOLHAS DA GATARIA</small><h2>CAMISETAS EM DESTAQUE</h2></div><a href="/produtos">VER TODAS →</a></div>
      <div className="productGrid">{products.map((product) => <ProductCard product={product} key={product.id}/>)}</div>
    </section>

    {content.statement.active && <section className="statement shell"><div className="statementCat"><img src={content.statement.image} alt=""/></div><div><h2>{content.statement.title}</h2><p>{content.statement.text}</p></div></section>}

    <section className="section shell">
      <div className="sectionTitle"><div><small>ESCOLHA SEU UNIVERSO</small><h2>COLEÇÕES GATARIA</h2></div><a href="/colecoes">VER TODAS →</a></div>
      <div className="collectionGrid">{collections.map((collection) => <a className="collectionCard" key={collection.id} href={`/colecoes/${collection.slug || collection.id}`} style={{ backgroundImage: `url(${collection.image})` }}><div><small>GATARIA</small><h3>{collection.name}</h3><span>VER COLEÇÃO</span></div></a>)}</div>
    </section>

    {content.featured.active && featuredProduct && <section className="featured shell">
      <div className="weekProduct"><span className="seal">DESTAQUE<br/>GATARIA</span><img src={featuredProduct.image} alt={featuredProduct.name}/></div>
      <div className="featuredInfo"><p className="featuredEyebrow">{content.featured.eyebrow}</p><h2>{featuredProduct.name}</h2><div className="stars">★★★★★ <small>({featuredProduct.rating || 0})</small></div><p>◈ {featuredProduct.material}</p><p>◈ {featuredProduct.print}</p><strong>R$ {featuredProduct.price}</strong>{featuredProduct.pix && <span>R$ {featuredProduct.pix} no PIX</span>}<a className="buyNow" href={`/produto/${featuredProduct.slug || featuredProduct.id}`}>VER DETALHES</a>{featuredWhatsapp && <a className="whatsappSecondary" href={featuredWhatsapp} target="_blank" rel="noreferrer">FALAR SOBRE ESTA CAMISETA</a>}</div>
      {content.reviews.active && <div className="reviews"><h2>{content.reviews.title}</h2>{content.reviews.items.map((review) => <blockquote key={review.id}><div className="stars">★★★★★</div><p>“{review.text}”</p><cite>– {review.name}</cite></blockquote>)}</div>}
    </section>}

    <section className="whatsappBand shell"><div><small>ATENDIMENTO DIRETO</small><h2>GOSTOU DE UMA CAMISETA?</h2><p>Chame a Gataria no WhatsApp para tirar dúvidas e combinar seu pedido.</p></div>{generalWhatsapp ? <a href={generalWhatsapp} target="_blank" rel="noreferrer">◉ ABRIR WHATSAPP</a> : <span>Cadastre o número no painel CMS</span>}</section>

    {content.instagram.active && <section className="instagram shell"><div className="sectionTitle"><h2>NOSSO INSTAGRAM</h2><span>{content.instagram.username}</span><a href={content.instagram.url || '#'} target="_blank" rel="noreferrer">VER PERFIL →</a></div><img src={content.instagram.image} alt={`Galeria do Instagram ${content.instagram.username}`}/></section>}
    <SiteFooter/>
  </main>;
}
