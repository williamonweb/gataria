'use client';
import { isProductAvailable, isSizeAvailable, isColorAvailable } from '../../lib/product-availability';

import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT, normalizeContent, slugify } from '../content';
import './admin.css';

const EMPTY_PRODUCT = {
  id: '', slug: '', name: '', type: 'Camiseta', category: '', collection: '', image: '', gallery: [],
  price: '59,90', pix: '', rating: 0, available: true, stock: 0, sku: '', description: '', material: '100% algodão',
  colorAvailability: {}, variantAvailability: {}, print: 'DTF Premium', colors: ['Preta'], sizes: ['P', 'M', 'G', 'GG'], models: ['Tradicional'], active: true, featured: false,
};

async function compressImage(file, maxWidth = 1400, quality = 0.78) {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL('image/webp', quality);
}

export default function AdminPage() {
  const [auth, setAuth] = useState({ loading: true, authenticated: false, configured: true });
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [contentReady, setContentReady] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(EMPTY_PRODUCT);
  const [message, setMessage] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { checkSession(); }, []);

  async function checkSession() {
    try {
      const session = await fetch('/api/admin/session', { cache: 'no-store' }).then((response) => response.json());
      setAuth({ loading: false, ...session });
      if (session.authenticated) { try { await loadContent(); } catch {} }
    } catch {
      setAuth({ loading: false, authenticated: false, configured: true });
    }
  }

  async function loadContent() {
    setContentLoading(true);
    setContentError('');
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      const data = await parsePublishResponse(response);
      if (!response.ok || !data.content) throw new Error(data.error || 'Não foi possível carregar o catálogo.');
      setContent(normalizeContent(data.content));
      setContentReady(true);
    } catch (error) {
      setContentError(error.message || 'Não foi possível carregar o catálogo.');
      throw error;
    } finally { setContentLoading(false); }
  }

  async function login(username, password) {
    const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.');
    setAuth((value) => ({ ...value, authenticated: true }));
    try { await loadContent(); } catch {
      setMessage({ tone: 'error', text: 'Login realizado, mas o catálogo não carregou. Confira DATABASE_URL do Neon e faça um novo deploy.' });
    }
  }

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setAuth((value) => ({ ...value, authenticated: false }));
    setContentReady(false);
    setContentError('');
  }

  function flash(text, tone = 'success') {
    setMessage({ text, tone });
    window.setTimeout(() => setMessage(null), 4200);
  }

  async function publish() {
    let publishedContent = content;
    if (editing !== null) {
      if (!draft.name.trim() || !draft.gallery?.length) return flash('Informe o nome e pelo menos uma foto antes de publicar.', 'error');
      const product = { ...draft, id: draft.id || `produto-${Date.now()}`, slug: draft.slug || slugify(draft.name), image: draft.gallery[0], gallery: draft.gallery };
      publishedContent = { ...content, products: editing === 'new' ? [...content.products, product] : content.products.map((item) => item.id === editing ? product : item) };
    }
    setPublishing(true);
    try {
      publishedContent = await uploadContentImages(publishedContent);
      const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: publishedContent }) });
      const data = await parsePublishResponse(response);
      if (!response.ok) throw new Error(data.error || 'Não foi possível publicar.');
      setContent(normalizeContent(data.content));
      setEditing(null);
      try { localStorage.setItem('gataria:published', String(Date.now())); } catch {}
      window.dispatchEvent(new Event('gataria:published'));
      flash('Alterações publicadas. O site atualiza automaticamente em até 5 segundos.');
    } catch (error) {
      flash(error.message, 'error');
      if (/sessão/i.test(error.message)) setAuth((value) => ({ ...value, authenticated: false }));
    } finally { setPublishing(false); }
  }

  function updateSection(section, field, value) {
    setContent((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  }
  function updateList(section, index, field, value) {
    setContent((current) => ({ ...current, [section]: current[section].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  }
  function updatePage(slug, field, value) {
    setContent((current) => ({ ...current, pages: { ...current.pages, [slug]: { ...current.pages[slug], [field]: value } } }));
  }

  function startNewProduct() {
    const id = `produto-${Date.now()}`;
    setDraft({ ...EMPTY_PRODUCT, id, sku: `GAT-${Date.now().toString().slice(-6)}`, collection: content.collections[0]?.id || '' });
    setEditing('new');
  }
  function editProduct(product) {
    const gallery = [...new Set([product.image, ...(product.gallery || [])].filter(Boolean))];
    setDraft({ ...EMPTY_PRODUCT, ...product, gallery, image: gallery[0] || '', colors: product.colors || [], sizes: product.sizes || [], models: product.models || [] });
    setEditing(product.id);
  }
  function productField(name, value) {
    setDraft((current) => ({ ...current, [name]: value, ...(name === 'name' ? { slug: slugify(value) } : {}) }));
  }
  function saveProduct() {
    if (!draft.name.trim() || !draft.gallery?.length) return flash('Informe o nome e pelo menos uma foto.', 'error');
    const product = { ...draft, id: draft.id || `produto-${Date.now()}`, slug: draft.slug || slugify(draft.name), image: draft.gallery[0], gallery: draft.gallery };
    setContent((current) => ({ ...current, products: editing === 'new' ? [...current.products, product] : current.products.map((item) => item.id === editing ? product : item) }));
    setEditing(null);
    flash('Produto salvo no rascunho. Agora clique em Publicar.');
  }
  function removeProduct(id) {
    const product = content.products.find((item) => item.id === id);
    setConfirmation({ title: 'Excluir produto?', text: `${product?.name || 'Este produto'} será removido do catálogo quando você publicar.`, label: 'SIM, EXCLUIR', danger: true, action: () => setContent((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) })) });
  }
  function addCollection() {
    const id = `colecao-${Date.now()}`;
    setContent((current) => ({ ...current, collections: [...current.collections, { id, slug: id, name: 'NOVA COLEÇÃO', description: 'Descrição da coleção.', image: '', active: false, featured: true }] }));
  }
  function removeCollection(id) {
    const collection = content.collections.find((item) => item.id === id);
    setConfirmation({ title: 'Excluir coleção?', text: `${collection?.name || 'Esta coleção'} será removida. Os produtos não serão excluídos, mas ficarão sem essa coleção.`, label: 'SIM, EXCLUIR', danger: true, action: () => setContent((current) => ({ ...current, collections: current.collections.filter((item) => item.id !== id) })) });
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `gataria-cms-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    URL.revokeObjectURL(url);
  }
  async function importBackup(file) {
    try { setContent(normalizeContent(JSON.parse(await file.text()))); flash('Backup carregado no rascunho. Revise e publique.'); }
    catch { flash('O arquivo de backup não é válido.', 'error'); }
  }

  if (auth.loading) return <div className="adminLoading"><span className="adminSpinner"/>Carregando painel...</div>;
  if (!auth.authenticated) return <LoginScreen configured={auth.configured} login={login}/>;
  if (contentLoading || (!contentReady && !contentError)) return <div className="adminLoading" role="status"><span className="adminSpinner"/>Carregando seu catálogo...</div>;
  if (!contentReady) return <div className="adminLoading"><div className="panel"><h2>Não foi possível abrir o catálogo</h2><p>{contentError}</p><button className="primary" onClick={() => loadContent().catch(() => {})}>TENTAR NOVAMENTE</button><button className="secondary" onClick={logout}>SAIR</button></div></div>;

  const stats = {
    products: content.products.length,
    active: content.products.filter((item) => item.active).length,
    stock: content.products.filter(isProductAvailable).length,
    collections: content.collections.filter((item) => item.active).length,
  };
  const tabs = [
    ['dashboard', '▦', 'Visão geral'], ['products', '👕', 'Produtos'], ['collections', '▣', 'Coleções'],
    ['home', '⌂', 'Página inicial'], ['navigation', '☰', 'Menu e categorias'], ['social', '◎', 'Redes e avaliações'],
    ['contact', '◉', 'WhatsApp e contato'], ['pages', '▤', 'Páginas e rodapé'], ['seo', '⌕', 'SEO'],
  ];

  return <main className="adminPage">
    <aside className="adminSidebar">
      <div className="adminBrand"><img src="/assets/logo-transparent.png" alt=""/><div><strong>GATARIA</strong><span>CMS</span></div></div>
      <nav>{tabs.map(([id, icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setEditing(null); }}><i>{icon}</i>{label}</button>)}</nav>
      <div className="sidebarFooter"><a href="/" target="_blank">ABRIR CATÁLOGO ↗</a><button onClick={logout}>SAIR DO PAINEL</button></div>
    </aside>
    <section className="adminContent">
      <header className="adminHeader"><div><p>PAINEL DE CONTEÚDO</p><h1>{tabs.find(([id]) => id === tab)?.[2]}</h1></div><div className="headerButtons"><button className="secondary" onClick={exportBackup}>BAIXAR BACKUP</button><label className="secondary importButton">IMPORTAR<input type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && importBackup(event.target.files[0])}/></label><button className="primary" disabled={publishing} onClick={publish}>{publishing ? 'PUBLICANDO...' : 'PUBLICAR ALTERAÇÕES'}</button></div></header>
      {message && <div className={`adminMessage ${message.tone}`}>{message.text}</div>}

      {tab === 'dashboard' && <Dashboard stats={stats} content={content} goTo={setTab} startNew={startNewProduct}/>} 
      {tab === 'products' && !editing && <ProductsPanel products={content.products} edit={editProduct} remove={removeProduct} startNew={startNewProduct}/>} 
      {tab === 'products' && editing && <ProductForm draft={draft} setDraft={setDraft} field={productField} collections={content.collections} save={saveProduct} cancel={() => setEditing(null)}/>} 
      {tab === 'collections' && <CollectionsPanel content={content} update={updateList} add={addCollection} remove={removeCollection}/>} 
      {tab === 'home' && <HomePanel content={content} update={updateSection}/>} 
      {tab === 'navigation' && <NavigationPanel content={content} setContent={setContent} update={updateSection} updateList={updateList}/>} 
      {tab === 'social' && <SocialPanel content={content} setContent={setContent} update={updateSection}/>} 
      {tab === 'contact' && <ContactPanel content={content} update={updateSection}/>} 
      {tab === 'pages' && <PagesPanel content={content} updatePage={updatePage} update={updateSection}/>} 
      {tab === 'seo' && <SeoPanel content={content} update={updateSection}/>} 
    </section>
    {confirmation && <ConfirmModal confirmation={confirmation} close={() => setConfirmation(null)} confirm={() => { confirmation.action(); setConfirmation(null); flash('Alteração feita no rascunho. Clique em Publicar.'); }}/>} 
  </main>;
}

function LoginScreen({ configured, login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(username, password); } catch (loginError) { setError(loginError.message); } finally { setBusy(false); }
  }
  return <main className="loginPage"><form className="loginCard" onSubmit={submit}><img src="/assets/logo-transparent.png" alt="Logo Gataria"/><small>PAINEL DE CONTEÚDO</small><h1>GATARIA CMS</h1><p>Entre para atualizar o catálogo, as coleções e o atendimento.</p>{configured ? <><label>Usuário<input type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" autoFocus required/></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required/></label>{error && <div className="loginError">{error}</div>}<button disabled={busy}>{busy ? 'ENTRANDO...' : 'ENTRAR NO PAINEL'}</button></> : <div className="loginError">Defina CMS_USERNAME, CMS_PASSWORD e CMS_SECRET na Vercel antes de acessar o painel.</div>}<a href="/">← Voltar ao catálogo</a></form></main>;
}

function Dashboard({ stats, content, goTo, startNew }) {
  const whatsappReady = Boolean(content.contact.whatsapp.replace(/\D/g, ''));
  return <><div className="statsGrid"><Stat number={stats.products} label="Produtos cadastrados"/><Stat number={stats.active} label="Produtos visíveis"/><Stat number={stats.stock} label="Produtos disponíveis"/><Stat number={stats.collections} label="Coleções publicadas"/></div><div className="dashboardGrid"><div className="panel"><div className="panelTitle"><div><span>PRÓXIMOS PASSOS</span><h2>Catálogo pronto para apresentar</h2></div></div><div className={`setupCheck ${whatsappReady ? 'done' : ''}`}><b>{whatsappReady ? '✓' : '1'}</b><div><strong>{whatsappReady ? 'WhatsApp configurado' : 'Cadastre o WhatsApp'}</strong><p>{whatsappReady ? content.contact.whatsapp : 'O botão dos produtos será ativado assim que você salvar o número.'}</p></div><button onClick={() => goTo('contact')}>CONFIGURAR</button></div><div className="setupCheck done"><b>✓</b><div><strong>Páginas de coleções</strong><p>{stats.collections} coleções estão disponíveis no catálogo.</p></div><button onClick={() => goTo('collections')}>GERENCIAR</button></div><button className="newProduct" onClick={() => { goTo('products'); startNew(); }}>+ ADICIONAR CAMISETA</button></div><div className="panel publishHelp"><span>COMO FUNCIONA</span><h2>Edite, revise e publique</h2><ol><li>Altere produtos, fotos e textos no painel.</li><li>Abra o catálogo em outra aba para revisar.</li><li>Clique em <b>Publicar alterações</b> no topo.</li></ol><p>Em produção, o banco Neon mantém o mesmo conteúdo para todos os visitantes.</p></div></div></>;
}
function Stat({ number, label }) { return <div className="statCard"><strong>{number}</strong><span>{label}</span></div>; }

function ProductsPanel({ products, edit, remove, startNew }) {
  return <div className="panel"><div className="panelTitleRow"><div><span>CATÁLOGO</span><h2>Produtos</h2><p className="description">Cadastre camisetas, organize fotos e controle o que aparece no site.</p></div><button className="newProduct" onClick={startNew}>+ NOVO PRODUTO</button></div><div className="productTable"><div className="tableHead"><span>PRODUTO</span><span>COLEÇÃO</span><span>PREÇO</span><span>DISPONIBILIDADE</span><span>STATUS</span><span>AÇÕES</span></div>{products.map((product) => <div className="tableRow" key={product.id}><span className="tableProduct"><img src={product.image || '/assets/logo-transparent.png'} alt=""/><div><strong>{product.name}</strong><small>{product.sku || 'Sem SKU'} • {product.type}</small></div></span><span>{product.collection || '—'}</span><span>R$ {product.price}</span><span>{isProductAvailable(product) ? 'Disponível' : 'Indisponível'}</span><span className={product.active ? 'status active' : 'status'}>{product.active ? 'VISÍVEL' : 'OCULTO'}</span><span className="rowActions"><a href={`/produto/${product.slug || product.id}`} target="_blank">VER</a><button onClick={() => edit(product)}>EDITAR</button><button className="danger" onClick={() => remove(product.id)}>EXCLUIR</button></span></div>)}</div></div>;
}

function ProductForm({ draft, setDraft, field, collections, save, cancel }) {
  function setGallery(gallery) { setDraft((current) => ({ ...current, gallery, image: gallery[0] || '' })); }
  return <div className="panel"><div className="panelTitleRow"><div><span>EDITOR DE PRODUTO</span><h2>{draft.name || 'Novo produto'}</h2><p className="description">A primeira imagem sempre será a foto principal.</p></div><button className="secondaryButton" onClick={cancel}>CANCELAR</button></div><GalleryEditor images={draft.gallery || []} onChange={setGallery}/><div className="formGrid"><Field label="Nome" value={draft.name} onChange={(value) => field('name', value)}/><Field label="Endereço amigável (slug)" value={draft.slug} onChange={(value) => field('slug', slugify(value))}/><SelectField label="Tipo" value={draft.type} onChange={(value) => field('type', value)} options={['Camiseta', 'Baby Look', 'Oversized', 'Moletom', 'Caneca', 'Quadro', 'Outro']}/><Field label="Categoria" value={draft.category} onChange={(value) => field('category', value)}/><SelectField label="Coleção" value={draft.collection} onChange={(value) => field('collection', value)} options={collections.map((item) => ({ value: item.id, label: item.name }))}/><Field label="SKU" value={draft.sku} onChange={(value) => field('sku', value)}/><Field label="Preço" value={draft.price} onChange={(value) => field('price', value)} prefix="R$"/><Toggle checked={draft.available} onChange={(value) => field('available', value)} label="Disponibilidade padrão dos tamanhos"/><Field label="Material" value={draft.material} onChange={(value) => field('material', value)}/><Field label="Tipo de estampa" value={draft.print} onChange={(value) => field('print', value)}/><ListField key={`${draft.id}-colors`} label="Cores (separadas por vírgula)" items={draft.colors || []} onChange={(items) => field('colors', items)}/><ListField key={`${draft.id}-sizes`} label="Tamanhos (separados por vírgula)" items={draft.sizes || []} onChange={(items) => field('sizes', items)}/><ListField key={`${draft.id}-models`} label="Modelos (separados por vírgula)" items={draft.models || []} onChange={(items) => field('models', items)}/></div><div className="panel sizeAvailabilityEditor"><h3>Disponibilidade por tamanho</h3><p>Marque os tamanhos disponíveis. Os desmarcados ficam desativados no site.</p><div className="checkRow">{(draft.sizes || []).map((size) => <Toggle key={size} label={size} checked={isSizeAvailable(draft, size)} onChange={(value) => field('sizeAvailability', { ...(draft.sizeAvailability || {}), [size]: value })}/>)}</div></div><div className="panel sizeAvailabilityEditor"><h3>Disponibilidade por cor e tamanho</h3><p>Desative a cor inteira ou marque os tamanhos disponíveis em cada cor. As combinações abaixo têm prioridade sobre a disponibilidade padrão.</p>{(draft.colors || []).map((color) => <div key={color} className="colorAvailabilityRow"><Toggle label={`${color} — cor habilitada`} checked={draft.colorAvailability?.[color] !== false} onChange={(value) => field('colorAvailability', { ...(draft.colorAvailability || {}), [color]: value })}/><ImageField label={`Foto da camiseta ${color}`} value={draft.colorImages?.[color] || ''} onChange={(value) => field('colorImages', { ...(draft.colorImages || {}), [color]: value })} hint="Esta foto aparece quando o cliente seleciona a cor. Sem foto, será usada a principal."/><SelectField label="Ou escolha uma foto da galeria" value={draft.colorImages?.[color] || ''} onChange={(value) => field('colorImages', { ...(draft.colorImages || {}), [color]: value })} options={[{ value: '', label: 'Usar foto principal' }, ...(draft.gallery || []).map((image, index) => ({ value: image, label: `Foto ${index + 1}` }))]}/><div className="checkRow">{(draft.sizes || []).map((size) => <Toggle key={size} label={size} checked={isSizeAvailable(draft, size, color)} onChange={(value) => field('variantAvailability', { ...(draft.variantAvailability || {}), [color]: { ...(draft.variantAvailability?.[color] || {}), [size]: value } })}/>)}</div><small>{isColorAvailable(draft, color) ? 'Cor disponível' : 'Cor indisponível'}</small></div>)}</div><label className="fullField">Descrição<textarea value={draft.description} onChange={(event) => field('description', event.target.value)}/></label><div className="checkRow"><Toggle checked={draft.active} onChange={(value) => field('active', value)} label="Produto visível no catálogo"/><Toggle checked={draft.featured} onChange={(value) => field('featured', value)} label="Mostrar nos destaques da home"/></div><button className="saveProduct" onClick={save}>SALVAR PRODUTO NO RASCUNHO</button></div>;
}

function GalleryEditor({ images, onChange }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  async function addFiles(event) {
    const files = [...(event.target.files || [])]; if (!files.length) return;
    setBusy(true);
    try { const additions = []; for (const file of files) additions.push(await compressImage(file)); onChange([...images, ...additions]); }
    finally { setBusy(false); event.target.value = ''; }
  }
  function move(index, direction) { const copy = [...images]; const target = index + direction; if (target < 0 || target >= copy.length) return; [copy[index], copy[target]] = [copy[target], copy[index]]; onChange(copy); }
  function makePrimary(index) { const copy = [...images]; const [selected] = copy.splice(index, 1); onChange([selected, ...copy]); }
  function addUrl() { if (!url.trim()) return; onChange([...images, url.trim()]); setUrl(''); }
  return <section className="galleryEditor"><div className="galleryHeader"><div><h3>Galeria de fotos</h3><p>Adicione várias imagens, defina a principal e organize a ordem.</p></div><label className="uploadButton">{busy ? 'PROCESSANDO...' : '+ ADICIONAR FOTOS'}<input type="file" accept="image/*" multiple onChange={addFiles}/></label></div>{images.length ? <div className="galleryAdminGrid">{images.map((image, index) => <article className={index === 0 ? 'galleryAdminItem primary' : 'galleryAdminItem'} key={`${image.slice(0, 60)}-${index}`}><img src={image} alt={`Foto ${index + 1}`}/>{index === 0 && <b>FOTO PRINCIPAL</b>}<div><button disabled={index === 0} onClick={() => makePrimary(index)}>PRINCIPAL</button><button disabled={index === 0} onClick={() => move(index, -1)}>←</button><button disabled={index === images.length - 1} onClick={() => move(index, 1)}>→</button><button className="danger" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}>EXCLUIR</button></div></article>)}</div> : <div className="emptyGallery">Nenhuma foto adicionada.</div>}<div className="urlAdder"><input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Ou cole a URL/caminho de uma imagem"/><button onClick={addUrl}>ADICIONAR URL</button></div></section>;
}

function CollectionsPanel({ content, update, add, remove }) {
  return <div className="panel"><div className="panelTitleRow"><div><span>ORGANIZAÇÃO DO CATÁLOGO</span><h2>Coleções</h2><p className="description">Cada coleção ganha uma página própria e reúne os produtos relacionados.</p></div><button className="newProduct" onClick={add}>+ NOVA COLEÇÃO</button></div><div className="adminCards">{content.collections.map((collection, index) => <article className="adminCard" key={collection.id}><ImageField label="Imagem de capa" value={collection.image} onChange={(value) => update('collections', index, 'image', value)} hint="Recomendado: 1200 × 700 px"/><div className="formGrid"><Field label="Nome" value={collection.name} onChange={(value) => update('collections', index, 'name', value)}/><Field label="Slug" value={collection.slug || collection.id} onChange={(value) => update('collections', index, 'slug', slugify(value))}/></div><label>Descrição<textarea value={collection.description || ''} onChange={(event) => update('collections', index, 'description', event.target.value)}/></label><div className="checkRow"><Toggle checked={collection.active} onChange={(value) => update('collections', index, 'active', value)} label="Coleção visível"/><Toggle checked={collection.featured !== false} onChange={(value) => update('collections', index, 'featured', value)} label="Exibir na home"/></div><div className="cardFooter"><span>{content.products.filter((product) => product.collection === collection.id).length} produtos</span><button className="dangerButton" onClick={() => remove(collection.id)}>EXCLUIR COLEÇÃO</button></div></article>)}</div></div>;
}

function HomePanel({ content, update }) {
  return <div className="stack"><div className="panel"><div className="panelTitle"><span>PRIMEIRA IMPRESSÃO</span><h2>Banner principal</h2></div><ImageField label="Imagem do banner" value={content.hero.image} onChange={(value) => update('hero', 'image', value)} hint="Recomendado: 1920 × 800 px, sem textos."/><div className="formGrid"><Field label="Texto superior" value={content.hero.eyebrow} onChange={(value) => update('hero', 'eyebrow', value)}/><Field label="Título (quebra de linha com Enter)" value={content.hero.title} textarea onChange={(value) => update('hero', 'title', value)}/><Field label="Frase" value={content.hero.tagline} onChange={(value) => update('hero', 'tagline', value)}/><Field label="Texto do botão" value={content.hero.buttonText} onChange={(value) => update('hero', 'buttonText', value)}/><Field label="Destino do botão" value={content.hero.buttonHref} onChange={(value) => update('hero', 'buttonHref', value)}/></div><Toggle checked={content.hero.active} onChange={(value) => update('hero', 'active', value)} label="Exibir banner"/></div><div className="panel"><div className="panelTitle"><span>MANIFESTO</span><h2>Faixa institucional</h2></div><ImageField label="Imagem lateral" value={content.statement.image} onChange={(value) => update('statement', 'image', value)}/><div className="formGrid"><Field label="Título" value={content.statement.title} onChange={(value) => update('statement', 'title', value)}/><Field label="Descrição" value={content.statement.text} textarea onChange={(value) => update('statement', 'text', value)}/></div><Toggle checked={content.statement.active} onChange={(value) => update('statement', 'active', value)} label="Exibir faixa"/></div><div className="panel"><div className="panelTitle"><span>VITRINE</span><h2>Produto em destaque</h2></div><SelectField label="Produto" value={content.featured.productId} onChange={(value) => update('featured', 'productId', value)} options={content.products.map((product) => ({ value: product.id, label: product.name }))}/><Field label="Chamada" value={content.featured.eyebrow} onChange={(value) => update('featured', 'eyebrow', value)}/><Toggle checked={content.featured.active} onChange={(value) => update('featured', 'active', value)} label="Exibir destaque"/></div></div>;
}

function NavigationPanel({ content, setContent, update, updateList }) {
  function addMenu() { setContent((current) => ({ ...current, navigation: [...current.navigation, { id: `menu-${Date.now()}`, label: 'NOVO LINK', href: '/', active: true }] })); }
  function removeMenu(id) { setContent((current) => ({ ...current, navigation: current.navigation.filter((item) => item.id !== id) })); }
  function addCategory() { setContent((current) => ({ ...current, categories: [...current.categories, { id: `categoria-${Date.now()}`, icon: '⭐', label: 'NOVA', query: '', active: true }] })); }
  return <div className="stack"><div className="panel"><div className="panelTitle"><span>TOPO DO SITE</span><h2>Marca e aviso</h2></div><div className="formGrid"><Field label="Nome da marca" value={content.site.name} onChange={(value) => update('site', 'name', value)}/><Field label="Faixa de aviso" value={content.site.announcement} onChange={(value) => update('site', 'announcement', value)}/><Field label="Frase da marca" value={content.site.tagline} textarea onChange={(value) => update('site', 'tagline', value)}/></div></div><div className="panel"><div className="panelTitleRow"><div><span>NAVEGAÇÃO</span><h2>Links do menu</h2></div><button className="newProduct" onClick={addMenu}>+ NOVO LINK</button></div><div className="listEditor">{content.navigation.map((item, index) => <div className="listEditorRow" key={item.id}><input value={item.label} onChange={(event) => updateList('navigation', index, 'label', event.target.value)} aria-label="Nome do link"/><input value={item.href} onChange={(event) => updateList('navigation', index, 'href', event.target.value)} aria-label="Destino do link"/><Toggle checked={item.active} onChange={(value) => updateList('navigation', index, 'active', value)} label="Ativo"/><button className="dangerButton" onClick={() => removeMenu(item.id)}>EXCLUIR</button></div>)}</div></div><div className="panel"><div className="panelTitleRow"><div><span>ATALHOS DA HOME</span><h2>Categorias</h2></div><button className="newProduct" onClick={addCategory}>+ NOVA CATEGORIA</button></div><div className="listEditor">{content.categories.map((item, index) => <div className="listEditorRow categoryRow" key={item.id}><input value={item.icon} onChange={(event) => updateList('categories', index, 'icon', event.target.value)} aria-label="Ícone"/><input value={item.label} onChange={(event) => updateList('categories', index, 'label', event.target.value)} aria-label="Nome"/><input value={item.query} onChange={(event) => updateList('categories', index, 'query', event.target.value)} placeholder="Categoria do produto"/><Toggle checked={item.active} onChange={(value) => updateList('categories', index, 'active', value)} label="Ativa"/><button className="dangerButton" onClick={() => setContent((current) => ({ ...current, categories: current.categories.filter((category) => category.id !== item.id) }))}>EXCLUIR</button></div>)}</div></div></div>;
}

function SocialPanel({ content, setContent, update }) {
  function updateReview(index, field, value) { setContent((current) => ({ ...current, reviews: { ...current.reviews, items: current.reviews.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } })); }
  function changeInstagramItems(transform) {
    setContent((current) => ({ ...current, instagram: { ...current.instagram, items: transform(current.instagram.items || []) } }));
  }
  function addInstagramItem() {
    changeInstagramItems((items) => [...items, { id: `instagram-${Date.now()}`, image: '', url: '', alt: '' }]);
  }
  function updateInstagramItem(id, field, value) {
    changeInstagramItems((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }
  function removeInstagramItem(id) {
    changeInstagramItems((items) => items.filter((item) => item.id !== id));
  }
  function moveInstagramItem(index, direction) {
    changeInstagramItems((items) => {
      const copy = [...items];
      const target = index + direction;
      if (target < 0 || target >= copy.length) return copy;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }
  const instagramItems = content.instagram.items || [];
  return <div className="stack"><div className="panel"><div className="panelTitle"><span>REDES SOCIAIS</span><h2>Instagram oficial</h2><p className="description">Cadastre o perfil real da Gataria e use fotos reais das publicações. Cada imagem pode abrir diretamente o post correspondente.</p></div><div className="formGrid"><Field label="Usuário do Instagram" value={content.instagram.username} placeholder="@gataria" onChange={(value) => update('instagram', 'username', value)}/><Field label="Link do perfil" value={content.instagram.url} placeholder="https://www.instagram.com/seuusuario/" onChange={(value) => update('instagram', 'url', value)}/></div><Toggle checked={content.instagram.active} onChange={(value) => update('instagram', 'active', value)} label="Exibir Instagram na página inicial"/></div><div className="panel"><div className="panelTitleRow"><div><span>PUBLICAÇÕES</span><h2>Galeria do Instagram</h2><p className="description">Adicione até 12 fotos. A ordem abaixo será a mesma exibida no site.</p></div><button className="newProduct" disabled={instagramItems.length >= 12} onClick={addInstagramItem}>+ NOVA FOTO</button></div>{instagramItems.length ? <div className="instagramEditor">{instagramItems.map((item, index) => <article className="instagramPostCard" key={item.id}><div className="instagramPostNumber">PUBLICAÇÃO {index + 1}</div><ImageField label="Imagem da publicação" value={item.image} onChange={(value) => updateInstagramItem(item.id, 'image', value)} hint="Use a foto real publicada no Instagram, de preferência quadrada."/><Field label="Link desta publicação" value={item.url} placeholder="https://www.instagram.com/p/.../" onChange={(value) => updateInstagramItem(item.id, 'url', value)}/><Field label="Descrição da imagem" value={item.alt} placeholder="Ex.: Camiseta Gataria Rock" onChange={(value) => updateInstagramItem(item.id, 'alt', value)}/><div className="instagramPostActions"><button disabled={index === 0} onClick={() => moveInstagramItem(index, -1)}>← VOLTAR</button><button disabled={index === instagramItems.length - 1} onClick={() => moveInstagramItem(index, 1)}>AVANÇAR →</button><button className="dangerButton" onClick={() => removeInstagramItem(item.id)}>EXCLUIR</button></div></article>)}</div> : <div className="emptyInstagram"><strong>Nenhuma publicação adicionada</strong><span>Clique em “Nova foto” para montar a galeria real da Gataria.</span></div>}</div><div className="panel"><div className="panelTitle"><span>PROVA SOCIAL</span><h2>Avaliações</h2></div><Field label="Título da seção" value={content.reviews.title} onChange={(value) => update('reviews', 'title', value)}/><div className="reviewEditor">{content.reviews.items.map((review, index) => <div key={review.id}><Field label={`Depoimento ${index + 1}`} value={review.text} onChange={(value) => updateReview(index, 'text', value)}/><Field label="Nome" value={review.name} onChange={(value) => updateReview(index, 'name', value)}/></div>)}</div><Toggle checked={content.reviews.active} onChange={(value) => update('reviews', 'active', value)} label="Exibir avaliações"/></div></div>;
}

function ContactPanel({ content, update }) {
  const digits = content.contact.whatsapp.replace(/\D/g, '');
  return <div className="panel contactPanel"><div className="panelTitle"><span>CANAL DE ATENDIMENTO</span><h2>WhatsApp e contato</h2><p className="description">O número abaixo ativa automaticamente os botões nas páginas de produto.</p></div><div className={digits ? 'whatsappStatus ready' : 'whatsappStatus'}><b>{digits ? '✓' : '!'}</b><div><strong>{digits ? 'WHATSAPP ATIVO' : 'WHATSAPP AINDA NÃO CONFIGURADO'}</strong><p>{digits ? `Os visitantes serão direcionados para ${content.contact.whatsapp}.` : 'Informe o número com DDD. Exemplo: (51) 99999-9999.'}</p></div></div><div className="formGrid"><Field label="Número do WhatsApp com DDD" value={content.contact.whatsapp} onChange={(value) => update('contact', 'whatsapp', value)} placeholder="(51) 99999-9999"/><Field label="Texto do botão" value={content.contact.whatsappLabel} onChange={(value) => update('contact', 'whatsappLabel', value)}/><Field label="Mensagem inicial" value={content.contact.whatsappMessage} textarea onChange={(value) => update('contact', 'whatsappMessage', value)}/><Field label="E-mail" value={content.contact.email} onChange={(value) => update('contact', 'email', value)}/><Field label="Horário de atendimento" value={content.contact.hours} onChange={(value) => update('contact', 'hours', value)}/></div><div className="messagePreview"><small>PRÉVIA DA MENSAGEM</small><p>{content.contact.whatsappMessage}<br/><b>Nome da camiseta</b><br/>Código, modelo, cor, tamanho e preço escolhidos.</p></div></div>;
}

function PagesPanel({ content, updatePage, update }) {
  return <div className="stack">{Object.entries(content.pages).map(([slug, page]) => <div className="panel" key={slug}><div className="panelTitle"><span>PÁGINA /{slug}</span><h2>{page.title}</h2></div><div className="formGrid"><Field label="Texto superior" value={page.eyebrow} onChange={(value) => updatePage(slug, 'eyebrow', value)}/><Field label="Título" value={page.title} onChange={(value) => updatePage(slug, 'title', value)}/></div><Field label="Conteúdo" value={page.body} textarea onChange={(value) => updatePage(slug, 'body', value)}/></div>)}<div className="panel"><div className="panelTitle"><span>RODAPÉ</span><h2>Textos finais</h2></div><div className="formGrid"><Field label="Descrição da marca" value={content.footer.description} textarea onChange={(value) => update('footer', 'description', value)}/><Field label="Direitos autorais" value={content.footer.copyright} onChange={(value) => update('footer', 'copyright', value)}/></div></div></div>;
}

function SeoPanel({ content, update }) {
  return <div className="panel"><div className="panelTitle"><span>GOOGLE E COMPARTILHAMENTO</span><h2>SEO do site</h2><p className="description">Esses textos identificam a Gataria nos buscadores e ao compartilhar o link.</p></div><Field label="Título do site" value={content.seo.title} onChange={(value) => update('seo', 'title', value)}/><Field label="Descrição" value={content.seo.description} textarea onChange={(value) => update('seo', 'description', value)}/><div className="seoPreview"><small>PRÉVIA</small><h3>{content.seo.title}</h3><span>gataria.com.br</span><p>{content.seo.description}</p></div></div>;
}

function ImageField({ label, value, onChange, hint }) {
  const [busy, setBusy] = useState(false);
  async function selectFile(event) {
    const file = event.target.files?.[0]; if (!file) return; setBusy(true);
    try { onChange(await compressImage(file)); } finally { setBusy(false); event.target.value = ''; }
  }
  return <div className="imageField"><label>{label}</label><div className="preview">{value ? <img src={value} alt="Prévia"/> : <span>Sem imagem</span>}</div><div className="imageActions"><label className="uploadButton">{busy ? 'PROCESSANDO...' : 'ESCOLHER IMAGEM'}<input type="file" accept="image/*" onChange={selectFile}/></label><input value={value?.startsWith('data:') ? '' : value || ''} onChange={(event) => onChange(event.target.value)} placeholder="ou cole uma URL/caminho"/></div>{hint && <small>{hint}</small>}</div>;
}
function Field({ label, value = '', onChange, type = 'text', textarea = false, placeholder = '', prefix = '' }) {
  return <label className="field">{label}<span className={prefix ? 'inputWithPrefix' : ''}>{prefix && <i>{prefix}</i>}{textarea ? <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)}/> : <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)}/>}</span></label>;
}
function SelectField({ label, value, onChange, options }) {
  return <label className="field">{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => { const item = typeof option === 'string' ? { value: option, label: option } : option; return <option value={item.value} key={item.value}>{item.label}</option>; })}</select></label>;
}
function Toggle({ checked, onChange, label }) { return <label className="toggle"><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)}/><span/><b>{label}</b></label>; }
function ConfirmModal({ confirmation, close, confirm }) { return <div className="modalBackdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><div className="customModal" role="alertdialog" aria-modal="true"><button className="modalClose" onClick={close}>×</button><div className="modalIcon adminConfirmIcon">?</div><h2>{confirmation.title}</h2><p>{confirmation.text}</p><div className="modalActions"><button className="modalCancel" onClick={close}>CANCELAR</button><button className={confirmation.danger ? 'modalAction dangerAction' : 'modalAction'} onClick={confirm}>{confirmation.label}</button></div></div></div>; }

function ListField({ label, items, onChange }) {
  const [text, setText] = useState(() => items.join(', '));
  return <label className="field">{label}<input value={text} placeholder="Ex.: Preta, Branca, Cinza" onChange={(event) => {
    const value = event.target.value;
    setText(value);
    onChange([...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))]);
  }} onBlur={() => setText(items.join(', '))}/></label>;
}

async function parsePublishResponse(response) {
  const text = await response.text();
  if (response.status === 413) throw new Error('O envio ficou muito grande. Reduza o tamanho das fotos e tente novamente.');
  try { return JSON.parse(text); } catch { throw new Error('Não foi possível concluir o envio. Tente publicar novamente.'); }
}
async function uploadContentImages(content) {
  const uploaded = new Map();
  async function visit(value) {
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      if (!uploaded.has(value)) {
        const response = await fetch('/api/images', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: value }) });
        const data = await parsePublishResponse(response);
        if (!response.ok || !data.url) throw new Error(data.error || 'Não foi possível salvar uma foto.');
        uploaded.set(value, data.url);
      }
      return uploaded.get(value);
    }
    if (Array.isArray(value)) { const result = []; for (const item of value) result.push(await visit(item)); return result; }
    if (value && typeof value === 'object') { const result = {}; for (const [key, item] of Object.entries(value)) result[key] = await visit(item); return result; }
    return value;
  }
  return visit(content);
}
