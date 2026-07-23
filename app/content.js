export const DEFAULT_CONTENT = {
  hero: { image:'/assets/hero.jpg', eyebrow:'ROCK • GEEK • STREETWEAR', title:'NOVA\nCOLEÇÃO', tagline:'“Vista sua atitude.”', buttonText:'COMPRAR AGORA' },
  statement: { title:'NÃO USAMOS ESTAMPAS SEM PERSONALIDADE.', text:'Cada produto foi criado para quem vive música, cultura pop e atitude.', image:'/assets/logo-transparent.png' },
  collections: [
    { id:'rock', name:'ROCK', image:'/assets/collection-rock.jpg', active:true },
    { id:'anime', name:'ANIME', image:'/assets/collection-anime.jpg', active:true },
    { id:'pets', name:'PETS', image:'/assets/collection-pets.jpg', active:true },
    { id:'retro', name:'RETRÔ', image:'/assets/collection-retro.jpg', active:true }
  ],
  products: [
    { id:'gato', slug:'gato-rockeiro', name:'Gato Rockeiro', type:'Camiseta', category:'Gatos', collection:'pets', image:'/assets/product-gato.jpg', gallery:['/assets/product-gato.jpg'], price:'59,90', pix:'56,91', rating:128, stock:30, sku:'GAT-CAM-001', description:'Camiseta Gataria com estampa de gato roqueiro, produzida em algodão macio e estampa DTF premium.', material:'100% algodão', print:'DTF Premium', colors:['Preta','Branca'], sizes:['P','M','G','GG','XG'], models:['Tradicional','Baby Look','Oversized'], active:true, featured:true },
    { id:'anime', slug:'saiyajin-power', name:'Saiyajin Power', type:'Camiseta', category:'Anime', collection:'anime', image:'/assets/product-anime.jpg', gallery:['/assets/product-anime.jpg'], price:'59,90', pix:'56,91', rating:96, stock:24, sku:'GAT-CAM-002', description:'Camiseta inspirada em anime, com arte vibrante e acabamento premium.', material:'100% algodão', print:'DTF Premium', colors:['Preta'], sizes:['P','M','G','GG'], models:['Tradicional','Oversized'], active:true, featured:true },
    { id:'acdc', slug:'ac-cat', name:'AC CAT', type:'Camiseta', category:'Rock', collection:'rock', image:'/assets/product-acdc.jpg', gallery:['/assets/product-acdc.jpg'], price:'59,90', pix:'56,91', rating:74, stock:18, sku:'GAT-CAM-003', description:'Rock clássico com a personalidade felina da Gataria.', material:'100% algodão', print:'DTF Premium', colors:['Preta','Cinza'], sizes:['P','M','G','GG','XG'], models:['Tradicional','Baby Look'], active:true, featured:true },
    { id:'coragem', slug:'cao-coragem', name:'Cão Coragem', type:'Camiseta', category:'Desenhos', collection:'retro', image:'/assets/product-coragem.jpg', gallery:['/assets/product-coragem.jpg'], price:'59,90', pix:'56,91', rating:53, stock:21, sku:'GAT-CAM-004', description:'Uma estampa nostálgica e divertida para quem cresceu assistindo desenhos marcantes.', material:'100% algodão', print:'DTF Premium', colors:['Preta','Branca'], sizes:['P','M','G','GG'], models:['Tradicional','Baby Look'], active:true, featured:true },
    { id:'caneca-gato', slug:'caneca-gato-rock', name:'Caneca Gato Rock', type:'Caneca', category:'Gatos', collection:'pets', image:'/assets/product-gato.jpg', gallery:['/assets/product-gato.jpg'], price:'39,90', pix:'37,91', rating:18, stock:15, sku:'GAT-CAN-001', description:'Caneca de cerâmica com arte exclusiva Gataria.', material:'Cerâmica', print:'Sublimação premium', colors:['Branca'], sizes:['325 ml'], models:['Caneca'], active:true, featured:false }
  ],
  featured: { name:'Camiseta Elvis x Michael', image:'/assets/featured.jpg', price:'69,90', pix:'66,41', material:'100% Algodão', print:'DTF Premium', active:true },
  instagram: { image:'/assets/instagram.jpg', username:'@gataria', active:true },
  contact: { whatsapp:'(51) 99999-9999', email:'contato@gataria.com.br', hours:'Seg a Sex das 9h às 18h' }
};
export const STORAGE_KEY='gataria-site-content-v2';
export function slugify(value=''){ return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
