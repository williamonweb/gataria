'use client';
import { useSiteContent } from '../content-context';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function ColecoesPage() {
  const content = useSiteContent();
  const collections = content.collections.filter((item) => item.active);
  return <main><SiteHeader/><section className="catalogHero collectionsHero"><div className="shell"><p>ESCOLHA SEU UNIVERSO</p><h1>COLEÇÕES GATARIA</h1><span>Rock, anime, pets, nostalgia e tudo que combina com a sua atitude.</span></div></section><section className="collectionsPage shell">{collections.map((collection) => {
    const count = content.products.filter((product) => product.active && product.collection === collection.id).length;
    return <a className="collectionPageCard" href={`/colecoes/${collection.slug || collection.id}`} key={collection.id}><img src={collection.image} alt=""/><div><small>{count} {count === 1 ? 'PRODUTO' : 'PRODUTOS'}</small><h2>{collection.name}</h2><p>{collection.description}</p><span>EXPLORAR COLEÇÃO →</span></div></a>;
  })}</section><SiteFooter/></main>;
}
