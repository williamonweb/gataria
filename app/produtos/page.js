'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSiteContent } from '../content-context';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import ProductCard from '../components/ProductCard';

export default function ProdutosPage() {
  const content = useSiteContent();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Todos');
  const [category, setCategory] = useState('Todas');

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get('categoria');
    if (selected) setCategory(selected);
  }, []);

  const activeProducts = content.products.filter((product) => product.active);
  const types = ['Todos', ...new Set(activeProducts.map((product) => product.type || 'Camiseta'))];
  const categories = ['Todas', ...new Set(activeProducts.map((product) => product.category).filter(Boolean))];
  const products = useMemo(() => activeProducts.filter((product) => {
    const matchesSearch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (type === 'Todos' || product.type === type) && (category === 'Todas' || product.category === category);
  }), [activeProducts, category, search, type]);

  return <main>
    <SiteHeader/>
    <section className="catalogHero"><div className="shell"><p>CATÁLOGO GATARIA</p><h1>NOSSAS CAMISETAS</h1><span>Explore as estampas, escolha seu modelo e fale com a gente.</span></div></section>
    <section className="catalog shell">
      <aside><h3>FILTRAR</h3><input aria-label="Buscar produto" placeholder="Buscar camiseta" value={search} onChange={(event) => setSearch(event.target.value)}/><label>TIPO</label>{types.map((item) => <button className={type === item ? 'selected' : ''} onClick={() => setType(item)} key={item}>{item}</button>)}<label>CATEGORIA</label>{categories.map((item) => <button className={category === item ? 'selected' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</aside>
      <div><div className="catalogTop"><strong>{products.length} {products.length === 1 ? 'PRODUTO' : 'PRODUTOS'}</strong><span>Compra pelo WhatsApp em breve</span></div>{products.length ? <div className="productGrid">{products.map((product) => <ProductCard product={product} key={product.id}/>)}</div> : <div className="emptyResults"><h2>Nenhuma camiseta encontrada</h2><p>Tente limpar os filtros ou buscar outro nome.</p><button onClick={() => { setSearch(''); setType('Todos'); setCategory('Todas'); }}>LIMPAR FILTROS</button></div>}</div>
    </section>
    <SiteFooter/>
  </main>;
}
