'use client';

import { useMemo, useState } from 'react';

const products = [
  { name: 'Gato Rockeiro', image: '/assets/product-gato.jpg', rating: 128 },
  { name: 'Saiyajin Power', image: '/assets/product-anime.jpg', rating: 96 },
  { name: 'AC CAT', image: '/assets/product-acdc.jpg', rating: 74 },
  { name: 'Cão Coragem', image: '/assets/product-coragem.jpg', rating: 53 }
];

const collections = [
  { name: 'ROCK', image: '/assets/collection-rock.jpg' },
  { name: 'ANIME', image: '/assets/collection-anime.jpg' },
  { name: 'PETS', image: '/assets/collection-pets.jpg' },
  { name: 'RETRÔ', image: '/assets/collection-retro.jpg' }
];

const categories = [
  ['😺', 'GATOS'], ['🤘', 'ROCK'], ['🥷', 'ANIME'], ['🎮', 'GAMES'],
  ['🎬', 'FILMES'], ['💀', 'CAVEIRAS'], ['😁', 'MEMES'], ['⭐', 'LANÇAMENTOS']
];

export default function Home() {
  const [cart, setCart] = useState(2);
  const [size, setSize] = useState('M');
  const [menuOpen, setMenuOpen] = useState(false);
  const pricePix = useMemo(() => 'R$ 66,41 no PIX', []);

  function addToCart() {
    setCart((value) => value + 1);
  }

  return (
    <main>
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Gataria">
          <img src="/assets/logo-transparent.png" alt="Logo Gataria" />
          <span>GATARIA</span>
        </a>

        <button className="menuButton" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">☰</button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <a className="active" href="#inicio">HOME</a>
          <a href="#colecoes">COLEÇÕES</a>
          <a href="#produtos">NOVIDADES</a>
          <a href="#produtos">PROMOÇÕES</a>
          <a href="#sobre">SOBRE</a>
          <a href="#rodape">CONTATO</a>
        </nav>

        <div className="headerActions">
          <button>♡<small>FAVORITOS</small></button>
          <button className="cart">🛒<i>{cart}</i><small>CARRINHO</small></button>
          <button>◉<small>MINHA CONTA</small></button>
        </div>
      </header>

      <section id="inicio" className="hero">
        <div className="heroOverlay" />
        <div className="heroContent">
          <p className="eyebrow">ROCK • GEEK • STREETWEAR</p>
          <h1>NOVA<br/>COLEÇÃO</h1>
          <p className="heroTagline">“Vista sua atitude.”</p>
          <a className="primaryButton" href="#produtos">COMPRAR AGORA</a>
        </div>
        <div className="heroLightning one">ϟ</div>
        <div className="heroLightning two">ϟ</div>
        <div className="sliderDots"><span></span><span></span><span></span></div>
      </section>

      <section className="categoryBar" aria-label="Categorias">
        {categories.map(([icon, label]) => (
          <button key={label}><b>{icon}</b><span>{label}</span></button>
        ))}
      </section>

      <section id="produtos" className="section shell">
        <div className="sectionTitle"><h2>PRODUTOS EM DESTAQUE</h2><a href="#">VER TODOS →</a></div>
        <div className="productGrid">
          {products.map((product) => (
            <article className="productCard" key={product.name}>
              <div className="productImage"><img src={product.image} alt={product.name} /></div>
              <h3>{product.name}</h3>
              <div className="stars">★★★★★ <small>({product.rating})</small></div>
              <strong>R$ 59,90</strong>
              <span className="pix">R$ 56,91 no PIX</span>
              <button onClick={addToCart}>COMPRAR</button>
            </article>
          ))}
        </div>
      </section>

      <section id="sobre" className="statement shell">
        <div className="statementCat"><img src="/assets/logo-transparent.png" alt="" /></div>
        <div><h2>NÃO USAMOS ESTAMPAS SEM PERSONALIDADE.</h2><p>Cada camiseta foi criada para quem vive<br/>música, cultura pop e atitude.</p></div>
      </section>

      <section id="colecoes" className="section shell">
        <div className="sectionTitle"><h2>NOSSAS COLEÇÕES</h2><a href="#">VER TODAS →</a></div>
        <div className="collectionGrid">
          {collections.map((collection) => (
            <article className="collectionCard" key={collection.name} style={{ backgroundImage: `url(${collection.image})` }}>
              <div><small>GATARIA</small><h3>{collection.name}</h3><button>VER COLEÇÃO</button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="featured shell">
        <div className="weekProduct">
          <span className="seal">CAMISETA<br/>DA SEMANA</span>
          <img src="/assets/featured.jpg" alt="Camiseta Elvis x Michael" />
        </div>
        <div className="featuredInfo">
          <h2>Camiseta Elvis x Michael</h2>
          <div className="stars">★★★★★ <small>(91)</small></div>
          <p>◈ 100% Algodão</p><p>◈ DTF Premium</p>
          <strong>R$ 69,90</strong><span>{pricePix}</span>
          <label>TAMANHO</label>
          <div className="sizes">{['P','M','G','GG','XG'].map((item)=><button className={size===item?'selected':''} onClick={()=>setSize(item)} key={item}>{item}</button>)}</div>
          <button className="buyNow" onClick={addToCart}>🛒 COMPRAR AGORA</button>
        </div>
        <div className="reviews">
          <h2>O QUE NOSSOS CLIENTES DIZEM</h2>
          {[['Qualidade absurda.','Lucas M.'],['Estampa perfeita.','Mariana S.'],['Já comprei três e vou comprar mais!','Rafael T.']].map(([text,name])=>(
            <blockquote key={name}><div className="stars">★★★★★</div><p>“{text}”</p><cite>– {name}</cite></blockquote>
          ))}
        </div>
      </section>

      <section className="instagram shell">
        <div className="sectionTitle"><h2>NOSSO INSTAGRAM</h2><span>@gataria</span><a href="#">VER MAIS →</a></div>
        <img src="/assets/instagram.jpg" alt="Galeria do Instagram Gataria" />
      </section>

      <footer id="rodape" className="footer">
        <div className="footerBrand"><div className="brand"><img src="/assets/logo-transparent.png" alt="Logo Gataria" /><span>GATARIA</span></div><p>Rock, Geek e Streetwear.<br/>Vista sua atitude todos os dias.</p><div>◎ ♪ ◉ ▶</div></div>
        <div><h4>INSTITUCIONAL</h4><a>Quem Somos</a><a>Trocas e Devoluções</a><a>Frete e Prazos</a><a>Política de Privacidade</a><a>Termos de Uso</a></div>
        <div><h4>AJUDA</h4><a>Como Comprar</a><a>Formas de Pagamento</a><a>Perguntas Frequentes</a><a>Fale Conosco</a></div>
        <div><h4>ATENDIMENTO</h4><a>◉ (51) 99999-9999</a><a>✉ contato@gataria.com.br</a><a>⌖ Seg a Sex das 9h às 18h</a></div>
        <div><h4>FORMAS DE PAGAMENTO</h4><div className="payments">PIX · VISA · MASTER · ELO</div><p>🔒 SITE 100% SEGURO<br/><small>Seus dados protegidos.</small></p></div>
        <p className="copyright">© 2026 Gataria. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
