function baseAvailability(product) {
  return typeof product.available === 'boolean' ? product.available : Number(product.stock) > 0;
}
export function isSizeAvailable(product = {}, size) {
  const value = product.sizeAvailability?.[size];
  return typeof value === 'boolean' ? value : baseAvailability(product);
}
export function isProductAvailable(product = {}) {
  if (product.sizes?.length) return product.sizes.some((size) => isSizeAvailable(product, size));
  return baseAvailability(product);
}
