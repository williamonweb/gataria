export default function ProductCard({ product }) {
  const stock = Math.max(0, Number(product.stock) || 0);
  return <article className="productCard">
    <a href={`/produto/${product.slug || product.id}`}>
      <div className="productImage"><img src={product.image} alt={product.name}/>{product.featured && <span className="productFlag">DESTAQUE</span>}</div>
      <h3>{product.name}</h3>
    </a>
    <small className="productType">{product.type || 'Camiseta'} • {product.category || 'Gataria'}</small>
    <div className="stars">★★★★★ <small>({product.rating || 0})</small></div>
    <strong>R$ {product.price}</strong>
    {product.pix && <span className="pix">R$ {product.pix} no PIX</span>}
    <span className={stock ? 'stockCard' : 'stockCard out'}>{stock ? `${stock} ${stock === 1 ? 'unidade disponível' : 'unidades disponíveis'}` : 'Produto esgotado'}</span>
    <a className="cardButton" href={`/produto/${product.slug || product.id}`}>VER CAMISETA</a>
  </article>;
}
