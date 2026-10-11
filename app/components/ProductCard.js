import { isProductAvailable } from '../../lib/product-availability';
export default function ProductCard({ product }) {
  const stock = isProductAvailable(product);
  return <article className="productCard">
    <a href={`/produto/${product.slug || product.id}`}>
      <div className="productImage"><img src={product.image} alt={product.name}/>{product.featured && <span className="productFlag">DESTAQUE</span>}</div>
      <h3>{product.name}</h3>
    </a>
    <small className="productType">{product.type || 'Camiseta'} • {product.category || 'Gataria'}</small>
    <div className="stars">★★★★★ <small>({product.rating || 0})</small></div>
    <strong>R$ {product.price}</strong>
    <span className={stock ? 'stockCard' : 'stockCard out'}>{stock ? 'Disponível' : 'Indisponível'}</span>
    <a className="cardButton" href={`/produto/${product.slug || product.id}`}>VER CAMISETA</a>
  </article>;
}
