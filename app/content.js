export const DEFAULT_CONTENT = {
  site: {
    name: 'GATARIA',
    tagline: 'Rock, Geek e Streetwear. Vista sua atitude todos os dias.',
    announcement: 'CATÁLOGO GATARIA • FALE COM A GENTE PELO WHATSAPP',
  },
  navigation: [
    { id: 'home', label: 'HOME', href: '/', active: true },
    { id: 'products', label: 'CAMISETAS', href: '/produtos', active: true },
    { id: 'collections', label: 'COLEÇÕES', href: '/colecoes', active: true },
    { id: 'about', label: 'SOBRE', href: '/pagina/sobre', active: true },
    { id: 'contact', label: 'CONTATO', href: '/pagina/contato', active: true },
  ],
  hero: {
    image: '/assets/hero.jpg',
    eyebrow: 'ROCK • GEEK • STREETWEAR',
    title: 'NOVA\nCOLEÇÃO',
    tagline: '“Vista sua atitude.”',
    buttonText: 'VER CAMISETAS',
    buttonHref: '/produtos',
    active: true,
  },
  categories: [
    { id: 'gatos', icon: '😺', label: 'GATOS', query: 'Gatos', active: true },
    { id: 'rock', icon: '🤘', label: 'ROCK', query: 'Rock', active: true },
    { id: 'anime', icon: '🥷', label: 'ANIME', query: 'Anime', active: true },
    { id: 'games', icon: '🎮', label: 'GAMES', query: 'Games', active: true },
    { id: 'filmes', icon: '🎬', label: 'FILMES', query: 'Filmes', active: true },
    { id: 'caveiras', icon: '💀', label: 'CAVEIRAS', query: 'Caveiras', active: true },
    { id: 'memes', icon: '😁', label: 'MEMES', query: 'Memes', active: true },
    { id: 'lancamentos', icon: '⭐', label: 'LANÇAMENTOS', query: '', active: true },
  ],
  statement: {
    title: 'NÃO USAMOS ESTAMPAS SEM PERSONALIDADE.',
    text: 'Cada produto foi criado para quem vive música, cultura pop e atitude.',
    image: '/assets/logo-transparent.png',
    active: true,
  },
  collections: [
    { id: 'rock', slug: 'rock', name: 'ROCK', description: 'Clássicos, riffs e muita atitude para vestir.', image: '/assets/collection-rock.jpg', active: true, featured: true },
    { id: 'anime', slug: 'anime', name: 'ANIME', description: 'Energia e referências para quem vive cada saga.', image: '/assets/collection-anime.jpg', active: true, featured: true },
    { id: 'pets', slug: 'pets', name: 'PETS', description: 'Personalidade felina e amor pelos bichos.', image: '/assets/collection-pets.jpg', active: true, featured: true },
    { id: 'retro', slug: 'retro', name: 'RETRÔ', description: 'Nostalgia, desenhos e ícones inesquecíveis.', image: '/assets/collection-retro.jpg', active: true, featured: true },
  ],
  products: [
    { id: 'gato', slug: 'gato-rockeiro', name: 'Gato Rockeiro', type: 'Camiseta', category: 'Gatos', collection: 'pets', image: '/assets/product-gato.jpg', gallery: ['/assets/product-gato.jpg'], price: '59,90', pix: '56,91', rating: 128, stock: 30, sku: 'GAT-CAM-001', description: 'Camiseta Gataria com estampa de gato roqueiro, produzida em algodão macio e estampa DTF premium.', material: '100% algodão', print: 'DTF Premium', colors: ['Preta', 'Branca'], sizes: ['P', 'M', 'G', 'GG', 'XG'], models: ['Tradicional', 'Baby Look', 'Oversized'], active: true, featured: true },
    { id: 'anime', slug: 'saiyajin-power', name: 'Saiyajin Power', type: 'Camiseta', category: 'Anime', collection: 'anime', image: '/assets/product-anime.jpg', gallery: ['/assets/product-anime.jpg'], price: '59,90', pix: '56,91', rating: 96, stock: 24, sku: 'GAT-CAM-002', description: 'Camiseta inspirada em anime, com arte vibrante e acabamento premium.', material: '100% algodão', print: 'DTF Premium', colors: ['Preta'], sizes: ['P', 'M', 'G', 'GG'], models: ['Tradicional', 'Oversized'], active: true, featured: true },
    { id: 'acdc', slug: 'ac-cat', name: 'AC CAT', type: 'Camiseta', category: 'Rock', collection: 'rock', image: '/assets/product-acdc.jpg', gallery: ['/assets/product-acdc.jpg'], price: '59,90', pix: '56,91', rating: 74, stock: 18, sku: 'GAT-CAM-003', description: 'Rock clássico com a personalidade felina da Gataria.', material: '100% algodão', print: 'DTF Premium', colors: ['Preta', 'Cinza'], sizes: ['P', 'M', 'G', 'GG', 'XG'], models: ['Tradicional', 'Baby Look'], active: true, featured: true },
    { id: 'coragem', slug: 'cao-coragem', name: 'Cão Coragem', type: 'Camiseta', category: 'Desenhos', collection: 'retro', image: '/assets/product-coragem.jpg', gallery: ['/assets/product-coragem.jpg'], price: '59,90', pix: '56,91', rating: 53, stock: 21, sku: 'GAT-CAM-004', description: 'Uma estampa nostálgica e divertida para quem cresceu assistindo desenhos marcantes.', material: '100% algodão', print: 'DTF Premium', colors: ['Preta', 'Branca'], sizes: ['P', 'M', 'G', 'GG'], models: ['Tradicional', 'Baby Look'], active: true, featured: true },
  ],
  featured: { active: true, productId: 'gato', eyebrow: 'CAMISETA EM DESTAQUE' },
  reviews: {
    active: true,
    title: 'O QUE NOSSOS CLIENTES DIZEM',
    items: [
      { id: 'review-1', text: 'Qualidade absurda.', name: 'Lucas M.' },
      { id: 'review-2', text: 'Estampa perfeita.', name: 'Mariana S.' },
      { id: 'review-3', text: 'Já comprei três e vou comprar mais!', name: 'Rafael T.' },
    ],
  },
  instagram: {
    image: '/assets/instagram.jpg',
    username: '@gataria',
    url: 'https://instagram.com/',
    active: true,
    items: [],
  },
  contact: {
    whatsapp: '',
    whatsappLabel: 'FALAR NO WHATSAPP',
    whatsappMessage: 'Olá! Vi este produto no site da Gataria e gostaria de saber mais:',
    email: 'contato@gataria.com.br',
    hours: 'Seg a Sex das 9h às 18h',
  },
  pages: {
    sobre: {
      title: 'SOBRE A GATARIA',
      eyebrow: 'NOSSA HISTÓRIA',
      body: 'A Gataria nasceu para transformar referências de música, cultura pop e universo pet em camisetas cheias de personalidade. Cada peça é pensada para quem gosta de vestir aquilo que vive.',
    },
    contato: {
      title: 'FALE COM A GATARIA',
      eyebrow: 'ATENDIMENTO',
      body: 'Gostou de uma camiseta ou quer tirar uma dúvida? Chame a gente pelo WhatsApp. Nesta primeira fase, os pedidos são combinados diretamente com nosso atendimento.',
    },
    privacidade: {
      title: 'POLÍTICA DE PRIVACIDADE',
      eyebrow: 'TRANSPARÊNCIA',
      body: 'A Gataria utiliza somente as informações necessárias para responder ao seu contato. Nenhum dado de pagamento é coletado por este catálogo.',
    },
  },
  footer: {
    description: 'Rock, Geek e Streetwear.\nVista sua atitude todos os dias.',
    copyright: '© 2026 Gataria. Todos os direitos reservados.',
  },
  seo: {
    title: 'Gataria | Camisetas Rock, Geek & Streetwear',
    description: 'Conheça as camisetas da Gataria e fale com a gente pelo WhatsApp.',
  },
};

export function slugify(value = '') {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function normalizeContent(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const merge = (key) => ({ ...DEFAULT_CONTENT[key], ...(source[key] || {}) });
  const instagram = merge('instagram');
  instagram.items = Array.isArray(source.instagram?.items)
    ? source.instagram.items
        .filter((item) => item && typeof item === 'object')
        .map((item, index) => ({ id: item.id || `instagram-${index + 1}`, image: item.image || '', url: item.url || '', alt: item.alt || '' }))
    : DEFAULT_CONTENT.instagram.items;
  return {
    ...DEFAULT_CONTENT,
    ...source,
    site: merge('site'),
    hero: merge('hero'),
    statement: merge('statement'),
    featured: merge('featured'),
    reviews: { ...DEFAULT_CONTENT.reviews, ...(source.reviews || {}), items: Array.isArray(source.reviews?.items) ? source.reviews.items : DEFAULT_CONTENT.reviews.items },
    instagram,
    contact: merge('contact'),
    footer: merge('footer'),
    seo: merge('seo'),
    pages: {
      ...DEFAULT_CONTENT.pages,
      ...(source.pages || {}),
      sobre: { ...DEFAULT_CONTENT.pages.sobre, ...(source.pages?.sobre || {}) },
      contato: { ...DEFAULT_CONTENT.pages.contato, ...(source.pages?.contato || {}) },
      privacidade: { ...DEFAULT_CONTENT.pages.privacidade, ...(source.pages?.privacidade || {}) },
    },
    navigation: Array.isArray(source.navigation) ? source.navigation : DEFAULT_CONTENT.navigation,
    categories: Array.isArray(source.categories) ? source.categories : DEFAULT_CONTENT.categories,
    collections: Array.isArray(source.collections)
      ? source.collections.map((item) => ({ ...item, slug: item.slug || slugify(item.name || item.id) }))
      : DEFAULT_CONTENT.collections,
    products: Array.isArray(source.products)
      ? source.products.map((item) => {
          const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];
          const image = item.image || gallery[0] || '';
          return { ...item, slug: item.slug || slugify(item.name || item.id), image, gallery: [...new Set([image, ...gallery].filter(Boolean))] };
        })
      : DEFAULT_CONTENT.products,
  };
}
