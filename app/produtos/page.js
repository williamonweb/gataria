'use client';
import { useEffect,useMemo,useState } from 'react';
import { DEFAULT_CONTENT,STORAGE_KEY } from '../content';
export default function ProdutosPage(){
 const [content,setContent]=useState(DEFAULT_CONTENT); const [search,setSearch]=useState(''); const [type,setType]=useState('Todos');
 useEffect(()=>{try{const s=localStorage.getItem(STORAGE_KEY);if(s)setContent({...DEFAULT_CONTENT,...JSON.parse(s)})}catch{}},[]);
 const types=['Todos',...new Set(content.products.filter(p=>p.active).map(p=>p.type||'Produto'))];
 const products=useMemo(()=>content.products.filter(p=>p.active&&(type==='Todos'||p.type===type)&&p.name.toLowerCase().includes(search.toLowerCase())),[content,search,type]);
 return <main><header className="simpleHeader"><a className="brand" href="/"><img src="/assets/logo-transparent.png"/><span>GATARIA</span></a><nav><a href="/">HOME</a><a className="active" href="/produtos">PRODUTOS</a><a href="/#colecoes">COLEÇÕES</a><a href="/admin">PAINEL</a></nav></header>
 <section className="catalogHero"><div className="shell"><p>ROCK • GEEK • STREETWEAR</p><h1>TODOS OS PRODUTOS</h1><span>Camisetas, canecas, moletons e muito mais.</span></div></section>
 <section className="catalog shell"><aside><h3>FILTRAR</h3><input placeholder="Buscar produto" value={search} onChange={e=>setSearch(e.target.value)}/>{types.map(t=><button className={type===t?'selected':''} onClick={()=>setType(t)} key={t}>{t}</button>)}</aside><div><div className="catalogTop"><strong>{products.length} PRODUTOS</strong></div><div className="productGrid">{products.map(p=><article className="productCard" key={p.id}><a href={`/produto/${p.slug||p.id}`}><div className="productImage"><img src={p.image} alt={p.name}/></div><h3>{p.name}</h3></a><small className="productType">{p.type}</small><div className="stars">★★★★★ <small>({p.rating||0})</small></div><strong>R$ {p.price}</strong><span className="pix">R$ {p.pix} no PIX</span><a className="cardButton" href={`/produto/${p.slug||p.id}`}>VER PRODUTO</a></article>)}</div></div></section></main>
}
