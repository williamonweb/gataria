'use client';
import { use } from 'react';
import { useSiteContent } from '../../content-context';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import ProductCard from '../../components/ProductCard';

export default function ColecaoPage({ params }) {
  const { slug } = use(params);
  const content = useSiteContent();
  const collection = content.collections.find((item) => (item.slug || item.id) === slug && item.active);
  if (!collection) return <main><SiteHeader/><section className="notFound"><h1>Coleção não encontrada</h1><a href="/colecoes">Ver todas as coleções</a></section><SiteFooter/></main>;
  const products = content.products.filter((product) => product.active && product.collection === collection.id);
  return <main><SiteHeader/><section className="collectionCover" style={{ backgroundImage: `url(${collection.image})` }}><div className="collectionCoverShade"/><div className="shell"><p>COLEÇÃO GATARIA</p><h1>{collection.name}</h1><span>{collection.description}</span></div></section><section className="section collectionProducts shell"><div className="sectionTitle"><h2>{products.length} {products.length === 1 ? 'PRODUTO' : 'PRODUTOS'}</h2><a href="/colecoes">← TODAS AS COLEÇÕES</a></div>{products.length ? <div className="productGrid">{products.map((product) => <ProductCard product={product} key={product.id}/>)}</div> : <div className="emptyResults"><h2>Novidades a caminho</h2><p>Esta coleção ainda não tem produtos publicados.</p><a className="primaryButton" href="/produtos">VER OUTRAS CAMISETAS</a></div>}</section><SiteFooter/></main>;
}
