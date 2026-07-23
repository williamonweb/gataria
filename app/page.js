'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONTENT, STORAGE_KEY } from './content';

const categories = [
  ['😺', 'GATOS'], ['🤘', 'ROCK'], ['🥷', 'ANIME'], ['🎮', 'GAMES'],
  ['🎬', 'FILMES'], ['💀', 'CAVEIRAS'], ['😁', 'MEMES'], ['⭐', 'LANÇAMENTOS']
];

export default function Home() {
  const [cart, setCart] = useState(2);
  const [size, setSize] = useState('M');
  const [menuOpen, setMenuOpen] = useState(false);
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setContent({ ...DEFAULT_CONTENT, ...JSON.parse(saved) });
    } catch (error) {
      console.error('Não foi possível carregar as configurações da Gataria.', error);
    }
  }, []);

  const pricePix = useMemo(() => `R$ ${content.featured.pix} no PIX`, [content.featured.pix]);
  const products = content.products.filter((item) => item.active && item.featured !== false).slice(0, 4);
  const collections = content.collections.filter((item) => item.active);

  function addToCart() { setCart((value) => value + 1); }

  return (
    <main>
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Gataria"><img src="/assets/logo-transparent.png" alt="Logo Gataria" /><span>GATARIA</span></a>
        <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">☰</button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <a className="active" href="#inicio">HOME</a><a href="#colecoes">COLEÇÕES</a><a href="#produtos">NOVIDADES</a><a href="#produtos">PROMOÇÕES</a><a href="#sobre">SOBRE</a><a href="#rodape">CONTATO</a>
        </nav>
        <div className="headerActions"><button>♡<small>FAVORITOS</small></button><button className="cart">🛒<i>{cart}</i><small>CARRINHO</small></button><button>◉<small>MINHA CONTA</small></button></div>
      </header>

      <section id="inicio" className="hero" style={{ backgroundImage: `url(${content.hero.image})` }}>
        <div className="heroOverlay" />
        <div className="heroContent"><p className="eyebrow">{content.hero.eyebrow}</p><h1>{content.hero.title.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h1><p className="heroTagline">{content.hero.tagline}</p><a className="primaryButton" href="#produtos">{content.hero.buttonText}</a></div>
        <div className="heroLightning one">ϟ</div><div className="heroLightning two">ϟ</div><div className="sliderDots"><span></span><span></span><span></span></div>
      </section>

      <section className="categoryBar" aria-label="Categorias">{categories.map(([icon, label]) => <button key={label}><b>{icon}</b><span>{label}</span></button>)}</section>

      <section id="produtos" className="section shell"><div className="sectionTitle"><h2>PRODUTOS EM DESTAQUE</h2><a href="/produtos">VER TODOS →</a></div><div className="productGrid">{products.map((product) => <article className="productCard" key={product.id}><a href={`/produto/${product.slug || product.id}`}><div className="productImage"><img src={product.image} alt={product.name} /></div><h3>{product.name}</h3></a><small className="productType">{product.type || 'Produto'}</small><div className="stars">★★★★★ <small>({product.rating || 0})</small></div><strong>R$ {product.price}</strong><span className="pix">R$ {product.pix} no PIX</span><a className="cardButton" href={`/produto/${product.slug || product.id}`}>VER PRODUTO</a></article>)}</div></section>

      <section id="sobre" className="statement shell"><div className="statementCat"><img src={content.statement.image} alt="" /></div><div><h2>{content.statement.title}</h2><p>{content.statement.text}</p></div></section>

      <section id="colecoes" className="section shell"><div className="sectionTitle"><h2>NOSSAS COLEÇÕES</h2><a href="#">VER TODAS →</a></div><div className="collectionGrid">{collections.map((collection) => <article className="collectionCard" key={collection.id} style={{ backgroundImage: `url(${collection.image})` }}><div><small>GATARIA</small><h3>{collection.name}</h3><button>VER COLEÇÃO</button></div></article>)}</div></section>

      {content.featured.active && <section className="featured shell"><div className="weekProduct"><span className="seal">CAMISETA<br/>DA SEMANA</span><img src={content.featured.image} alt={content.featured.name} /></div><div className="featuredInfo"><h2>{content.featured.name}</h2><div className="stars">★★★★★ <small>(91)</small></div><p>◈ {content.featured.material}</p><p>◈ {content.featured.print}</p><strong>R$ {content.featured.price}</strong><span>{pricePix}</span><label>TAMANHO</label><div className="sizes">{['P','M','G','GG','XG'].map((item)=><button className={size===item?'selected':''} onClick={()=>setSize(item)} key={item}>{item}</button>)}</div><button className="buyNow" onClick={addToCart}>🛒 COMPRAR AGORA</button></div><div className="reviews"><h2>O QUE NOSSOS CLIENTES DIZEM</h2>{[['Qualidade absurda.','Lucas M.'],['Estampa perfeita.','Mariana S.'],['Já comprei três e vou comprar mais!','Rafael T.']].map(([text,name])=><blockquote key={name}><div className="stars">★★★★★</div><p>“{text}”</p><cite>– {name}</cite></blockquote>)}</div></section>}

      {content.instagram.active && <section className="instagram shell"><div className="sectionTitle"><h2>NOSSO INSTAGRAM</h2><span>{content.instagram.username}</span><a href="#">VER MAIS →</a></div><img src={content.instagram.image} alt="Galeria do Instagram Gataria" /></section>}

      <footer id="rodape" className="footer"><div className="footerBrand"><div className="brand"><img src="/assets/logo-transparent.png" alt="Logo Gataria" /><span>GATARIA</span></div><p>Rock, Geek e Streetwear.<br/>Vista sua atitude todos os dias.</p><div>◎ ♪ ◉ ▶</div></div><div><h4>INSTITUCIONAL</h4><a>Quem Somos</a><a>Trocas e Devoluções</a><a>Frete e Prazos</a><a>Política de Privacidade</a><a>Termos de Uso</a></div><div><h4>AJUDA</h4><a>Como Comprar</a><a>Formas de Pagamento</a><a>Perguntas Frequentes</a><a>Fale Conosco</a></div><div><h4>ATENDIMENTO</h4><a>◉ {content.contact.whatsapp}</a><a>✉ {content.contact.email}</a><a>⌖ {content.contact.hours}</a></div><div><h4>FORMAS DE PAGAMENTO</h4><div className="payments">PIX · VISA · MASTER · ELO</div><p>🔒 SITE 100% SEGURO<br/><small>Seus dados protegidos.</small></p></div><p className="copyright">© 2026 Gataria. Todos os direitos reservados.</p></footer>
    </main>
  );
}
