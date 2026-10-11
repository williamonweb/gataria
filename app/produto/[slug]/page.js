'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useSiteContent } from '../../content-context';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import ProductWhatsapp from '../../components/ProductWhatsapp';
import { isProductAvailable, isSizeAvailable } from '../../../lib/product-availability';
import ProductCard from '../../components/ProductCard';
import { productWhatsappUrl } from '../../../lib/whatsapp';

export default function ProdutoPage({ params }) {
  const { slug } = use(params);
  const content = useSiteContent();
  const product = content.products.find((item) => (item.slug || item.id) === slug && item.active);
  const [selectedImage, setSelectedImage] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    if (!product) return;
    setSelectedImage(product.image);
    setSize(product.sizes?.find((item) => isSizeAvailable(product, item)) || '');
    setColor(product.colors?.[0] || '');
    setModel(product.models?.[0] || '');
  }, [product]);

  const gallery = useMemo(() => product ? [...new Set([product.image, ...(product.gallery || [])].filter(Boolean))] : [], [product]);
  if (!product) return <main><SiteHeader/><section className="notFound"><h1>Produto não encontrado</h1><a href="/produtos">Voltar às camisetas</a></section><SiteFooter/></main>;

  const stock = isProductAvailable(product);
  const whatsapp = productWhatsappUrl(content.contact, product, { model, color, size });
  const collection = content.collections.find((item) => item.id === product.collection);
  const related = content.products.filter((item) => item.active && item.id !== product.id && item.collection === product.collection).slice(0, 4);

  return <main>
    <SiteHeader/>
    <section className="breadcrumbs shell"><a href="/">Home</a> / <a href="/produtos">Camisetas</a> / {collection && <><a href={`/colecoes/${collection.slug || collection.id}`}>{collection.name}</a> / </>}{product.name}</section>
    <section className="productDetail shell">
      <div className="gallery"><div className="thumbs">{gallery.map((image, index) => <button className={selectedImage === image ? 'selected' : ''} onClick={() => setSelectedImage(image)} key={`${image}-${index}`} aria-label={`Ver foto ${index + 1}`}><img src={image} alt=""/></button>)}</div><div className="mainPhoto"><img src={selectedImage || product.image} alt={product.name}/></div></div>
      <div className="productInfo">
        <span className="badge">{product.type}</span><h1>{product.name}</h1><div className="stars">★★★★★ <small>({product.rating || 0} avaliações)</small></div>
        <div className="detailPrice">R$ {product.price}</div><p>{product.description}</p>
        {product.models?.length > 0 && <Option title="MODELO" items={product.models} value={model} setValue={setModel}/>} 
        {product.colors?.length > 0 && <Option title="COR" items={product.colors} value={color} setValue={setColor}/>} 
        {product.sizes?.length > 0 && <Option title="TAMANHO" items={product.sizes} value={size} setValue={setSize} isDisabled={(item) => !isSizeAvailable(product, item)}/>} 
        <div className={stock ? 'stockAvailability' : 'stockAvailability out'}><span aria-hidden="true">{stock ? '✓' : '!'}</span>{stock ? 'Disponível' : 'Indisponível'}</div>
        {whatsapp ? <ProductWhatsapp contact={content.contact} product={product} options={{ model, color, size }}>◉ {content.contact.whatsappLabel || 'FALAR NO WHATSAPP'}</ProductWhatsapp> : <div className="whatsappPending"><strong>WHATSAPP EM CONFIGURAÇÃO</strong><span>O número de atendimento será disponibilizado em breve.</span></div>}
        <p className="catalogModeNote">Este site funciona como catálogo. O atendimento confirma disponibilidade, prazo e forma de pagamento.</p>
        <div className="benefits"><span>💬 Atendimento direto</span><span>👕 Escolha modelo e tamanho</span><span>✓ Disponibilidade informada</span></div>
      </div>
    </section>
    <section className="detailsSection shell"><h2>DETALHES DO PRODUTO</h2><div><p><strong>Descrição</strong><br/>{product.description}</p><p><strong>Material</strong><br/>{product.material || 'Consultar descrição'}</p><p><strong>Estampa</strong><br/>{product.print || 'Premium'}</p><p><strong>SKU</strong><br/>{product.sku || '—'}</p></div></section>
    {related.length > 0 && <section className="section relatedProducts shell"><div className="sectionTitle"><h2>DA MESMA COLEÇÃO</h2></div><div className="productGrid">{related.map((item) => <ProductCard product={item} key={item.id}/>)}</div></section>}
    <SiteFooter/>
  </main>;
}

function Option({ title, items, value, setValue, isDisabled = () => false }) {
  return <div className="optionGroup"><label>{title}: <strong>{value || 'Nenhum disponível'}</strong></label><div>{items.map((item) => <button disabled={isDisabled(item)} title={isDisabled(item) ? `${item} indisponível` : item} aria-label={isDisabled(item) ? `${item} indisponível` : item} className={isDisabled(item) ? 'unavailableOption' : value === item ? 'selected' : ''} onClick={() => setValue(item)} key={item}>{item}</button>)}</div></div>;
}
