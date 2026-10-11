export function isProductAvailable(product = {}) {
  return typeof product.available === 'boolean' ? product.available : Number(product.stock) > 0;
}
