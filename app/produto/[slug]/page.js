'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_CONTENT, STORAGE_KEY } from '../../content';

const CART_KEY = 'gataria-cart-v1';

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

export default function ProdutoPage({ params }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [selectedImage, setSelectedImage] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [model, setModel] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('descricao');
  const [measureOpen, setMeasureOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent) setContent({ ...DEFAULT_CONTENT, ...JSON.parse(savedContent) });
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {}
  }, []);

  const product = content.products.find((item) => (item.slug || item.id) === params.slug);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(product.image || product.gallery?.[0] || '');
    setSize(product.sizes?.[0] || '');
    setColor(product.colors?.[0] || '');
    setModel(product.models?.[0] || '');
    setQty(1);
  }, [product?.id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return [...new Set([product.image, ...(product.gallery || [])].filter(Boolean))];
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    const active = content.products.filter((item) => item.active !== false && item.id !== product.id);
    const sameCollection = active.filter((item) => item.collection === product.collection);
    return [...sameCollection, ...active.filter((item) => item.collection !== product.collection)].slice(0, 4);
  }, [content.products, product]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const stock = Math.max(0, Number(product?.stock || 0));
  const saleValue = product?.promo || product?.price;
  const discount = product?.promo
    ? Math.max(0, Math.round((1 - numericPrice(product.promo) / numericPrice(product.price)) * 100))
    : 0;

  function persistCart(nextCart) {
    setCart(nextCart);
    localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
  }

  function addToCart(openDrawer = true) {
    if (!product || stock <= 0) return;
    if (product.models?.length && !model) return showToast('Escolha o modelo.');
    if (product.colors?.length && !color) return showToast('Escolha a cor.');
    if (product.sizes?.length && !size) return showToast('Escolha o tamanho.');

    const key = `${product.id}-${model}-${color}-${size}`;
    const existing = cart.find((item) => item.key === key);
    const currentQty = existing?.quantity || 0;
    const allowedQty = Math.min(qty, Math.max(0, stock - currentQty));

    if (allowedQty <= 0) return showToast('A quantidade máxima desse produto já está no carrinho.');

    const nextCart = existing
      ? cart.map((item) => item.key === key ? { ...item, quantity: item.quantity + allowedQty } : item)
      : [...cart, {
          key,
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: selectedImage || product.image,
          price: saleValue,
          pix: product.pix,
          model,
          color,
          size,
          quantity: allowedQty,
          stock,
        }];

    persistCart(nextCart);
    showToast('Produto adicionado ao carrinho.');
    if (openDrawer) setDrawerOpen(true);
  }

  function buyNow() {
    addToCart(false);
    setTimeout(() => setDrawerOpen(true), 80);
  }

  function changeCartQty(key, delta) {
    const next = cart.map((item) => item.key === key
      ? { ...item, quantity: Math.max(1, Math.min(item.stock || 99, item.quantity + delta)) }
      : item);
    persistCart(next);
  }

  function removeCartItem(key) {
    persistCart(cart.filter((item) => item.key !== key));
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__gatariaToast);
    window.__gatariaToast = window.setTimeout(() => setToast(''), 2600);
  }

  if (!product || product.active === false) {
    return <main className="notFound"><h1>Produto não encontrado</h1><a href="/produtos">Voltar aos produtos</a></main>;
  }

  return <main>
    <header className="simpleHeader productHeader">
      <a className="brand" href="/"><img src="/assets/logo-transparent.png" alt="Gataria"/><span>GATARIA</span></a>
      <nav><a href="/">HOME</a><a href="/produtos">PRODUTOS</a><a href="/admin">PAINEL</a></nav>
      <button className="productCartButton" onClick={() => setDrawerOpen(true)} aria-label="Abrir carrinho">🛒 <i>{cartCount}</i></button>
    </header>

    <section className="breadcrumbs shell"><a href="/">Home</a> / <a href="/produtos">Produtos</a> / {product.name}</section>

    <section className="productDetail shell">
      <div className="gallery">
        <div className="thumbs">
          {gallery.map((img, index) => <button type="button" className={selectedImage === img ? 'selected' : ''} onClick={() => setSelectedImage(img)} key={`${img}-${index}`} aria-label={`Ver imagem ${index + 1}`}><img src={img} alt=""/></button>)}
        </div>
        <div className="mainPhoto"><img src={selectedImage || product.image} alt={product.name}/></div>
      </div>

      <div className="productInfo">
        <div className="productBadges"><span className="badge">{product.type}</span>{discount > 0 && <span className="badge saleBadge">-{discount}%</span>}{(product.tags || []).map((tag) => <span className="badge" key={tag}>{tag}</span>)}</div>
        <h1>{product.name}</h1>
        <div className="stars">★★★★★ <small>({product.rating || 0} avaliações)</small></div>
        {product.promo && <div className="oldPrice">{money(product.price)}</div>}
        <div className="detailPrice">{money(saleValue)}</div>
        <p className="detailPix">{money(product.pix)} no PIX</p>
        <p className="installments">ou 3x de {money(numericPrice(saleValue) / 3)} sem juros</p>
        <p>{product.description}</p>

        {product.models?.length > 0 && <Option title="MODELO" items={product.models} value={model} setValue={setModel}/>} 
        {product.colors?.length > 0 && <Option title="COR" items={product.colors} value={color} setValue={setColor} colorMode/>}
        {product.sizes?.length > 0 && <Option title="TAMANHO" items={product.sizes} value={size} setValue={setSize}/>} 
        <button className="measureLink" type="button" onClick={() => setMeasureOpen(true)}>Consultar tabela de medidas</button>

        <div className="purchaseRow">
          <div className="quantity"><button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button type="button" disabled={qty >= stock} onClick={() => setQty(Math.min(stock, qty + 1))}>+</button></div>
          <button className="buyButton secondaryBuy" disabled={stock <= 0} onClick={() => addToCart(true)}>ADICIONAR AO CARRINHO</button>
        </div>
        <button className="buyNowButton" disabled={stock <= 0} onClick={buyNow}>{stock > 0 ? 'COMPRAR AGORA' : 'PRODUTO ESGOTADO'}</button>
        <div className={stock > 0 ? 'stock' : 'stock out'}>{stock > 0 ? `✓ Em estoque: ${stock} unidades` : 'Produto indisponível no momento'}</div>
        <div className="benefits"><span>🚚 Frete calculado no carrinho</span><span>🔒 Compra 100% segura</span><span>↻ Troca fácil</span></div>
      </div>
    </section>

    <section className="productTabs shell">
      <div className="tabButtons">
        <button className={tab === 'descricao' ? 'active' : ''} onClick={() => setTab('descricao')}>Descrição</button>
        <button className={tab === 'historia' ? 'active' : ''} onClick={() => setTab('historia')}>História da arte</button>
        <button className={tab === 'material' ? 'active' : ''} onClick={() => setTab('material')}>Material e cuidados</button>
        <button className={tab === 'medidas' ? 'active' : ''} onClick={() => setTab('medidas')}>Tabela de medidas</button>
      </div>
      <div className="tabContent">
        {tab === 'descricao' && <><h2>DETALHES DO PRODUTO</h2><p>{product.description}</p><div className="productMeta"><span><strong>Marca</strong>{product.brand || 'Gataria'}</span><span><strong>SKU</strong>{product.sku || '—'}</span><span><strong>Peso</strong>{product.weight ? `${product.weight} g` : '—'}</span></div></>}
        {tab === 'historia' && <><h2>A HISTÓRIA DESTA ARTE</h2><p>{product.story || 'Esta arte foi criada para vestir personalidade, música e cultura em uma peça com identidade própria.'}</p></>}
        {tab === 'material' && <><h2>MATERIAL E CUIDADOS</h2><p><strong>Material:</strong> {product.material || 'Consultar descrição.'}</p><p><strong>Estampa:</strong> {product.print || 'Premium.'}</p><ul><li>Lavar do avesso.</li><li>Não usar alvejante.</li><li>Não passar o ferro diretamente sobre a estampa.</li><li>Secar preferencialmente à sombra.</li></ul></>}
        {tab === 'medidas' && <SizeTable/>}
      </div>
    </section>

    {related.length > 0 && <section className="relatedSection shell"><div className="sectionTitle"><h2>VOCÊ TAMBÉM PODE GOSTAR</h2></div><div className="productGrid">{related.map((item) => <a className="productCard relatedCard" href={`/produto/${item.slug || item.id}`} key={item.id}><div className="productImage"><img src={item.image} alt={item.name}/></div><h3>{item.name}</h3><span className="productType">{item.type}</span><strong>{money(item.promo || item.price)}</strong><small className="pix">{money(item.pix)} no PIX</small><span className="cardButton">VER PRODUTO</span></a>)}</div></section>}

    {measureOpen && <div className="modalBackdrop" onMouseDown={() => setMeasureOpen(false)}><div className="measureModal" onMouseDown={(event) => event.stopPropagation()}><button className="modalClose" onClick={() => setMeasureOpen(false)}>×</button><SizeTable/><button className="modalDone" onClick={() => setMeasureOpen(false)}>ENTENDI</button></div></div>}

    <div className={`cartOverlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}/>
    <aside className={`cartDrawer ${drawerOpen ? 'open' : ''}`}>
      <div className="drawerHeader"><div><small>SEU CARRINHO</small><h2>{cartCount} {cartCount === 1 ? 'ITEM' : 'ITENS'}</h2></div><button onClick={() => setDrawerOpen(false)}>×</button></div>
      <div className="drawerItems">
        {cart.length === 0 ? <div className="emptyCart"><span>🛒</span><h3>Seu carrinho está vazio</h3><p>Escolha uma peça e vista sua atitude.</p></div> : cart.map((item) => <article className="drawerItem" key={item.key}><img src={item.image} alt={item.name}/><div><h3>{item.name}</h3><p>{[item.model, item.color, item.size].filter(Boolean).join(' • ')}</p><strong>{money(item.price)}</strong><div className="drawerQty"><button onClick={() => changeCartQty(item.key, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeCartQty(item.key, 1)}>+</button><button className="removeItem" onClick={() => removeCartItem(item.key)}>Remover</button></div></div></article>)}
      </div>
      {cart.length > 0 && <div className="drawerFooter"><div><span>Subtotal</span><strong>{money(cart.reduce((sum, item) => sum + numericPrice(item.price) * item.quantity, 0))}</strong></div><a className="checkoutButton" href="/carrinho">FINALIZAR COMPRA</a><button className="keepBuying" onClick={() => setDrawerOpen(false)}>CONTINUAR COMPRANDO</button></div>}
    </aside>

    {toast && <div className="productToast">{toast}</div>}
  </main>;
}

function Option({ title, items, value, setValue, colorMode = false }) {
  const colorMap = { preta: '#111', preto: '#111', branca: '#fff', branco: '#fff', cinza: '#777', vermelho: '#b62020', azul: '#174f9c', 'azul marinho': '#0d2548', 'verde militar': '#4f5b35', 'off white': '#eee7d5' };
  return <div className="optionGroup"><label>{title}: <strong>{value}</strong></label><div>{items.map((item) => <button type="button" className={`${value === item ? 'selected' : ''} ${colorMode ? 'colorOption' : ''}`} onClick={() => setValue(item)} key={item}>{colorMode && <i style={{ background: colorMap[item.toLowerCase()] || '#444' }}/>} {item}</button>)}</div></div>;
}

function SizeTable() {
  return <div className="sizeTableWrap"><h2>TABELA DE MEDIDAS</h2><p>Compare as medidas com uma peça que você já usa.</p><table className="sizeTable"><thead><tr><th>Tamanho</th><th>Largura</th><th>Comprimento</th></tr></thead><tbody><tr><td>P</td><td>50 cm</td><td>68 cm</td></tr><tr><td>M</td><td>52 cm</td><td>70 cm</td></tr><tr><td>G</td><td>54 cm</td><td>72 cm</td></tr><tr><td>GG</td><td>57 cm</td><td>75 cm</td></tr><tr><td>XG</td><td>60 cm</td><td>78 cm</td></tr></tbody></table><small>As medidas podem variar até 2 cm.</small></div>;
}
