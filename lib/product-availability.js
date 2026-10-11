function baseAvailability(product) {
  return typeof product.available === 'boolean' ? product.available : Number(product.stock) > 0;
}
export function isSizeAvailable(product = {}, size, color) {
  if (color && product.colorAvailability?.[color] === false) return false;
  const variant = color ? product.variantAvailability?.[color]?.[size] : undefined;
  if (typeof variant === 'boolean') return variant;
  const value = product.sizeAvailability?.[size];
  return typeof value === 'boolean' ? value : baseAvailability(product);
}
export function isColorAvailable(product = {}, color) {
  if (product.colorAvailability?.[color] === false) return false;
  if (product.sizes?.length) return product.sizes.some((size) => isSizeAvailable(product, size, color));
  const value = product.colorAvailability?.[color];
  return typeof value === 'boolean' ? value : baseAvailability(product);
}
export function isProductAvailable(product = {}) {
  if (product.colors?.length) return product.colors.some((color) => isColorAvailable(product, color));
  if (product.sizes?.length) return product.sizes.some((size) => isSizeAvailable(product, size));
  return baseAvailability(product);
}
export function isSelectionAvailable(product = {}, options = {}) {
  if (options.color && !isColorAvailable(product, options.color)) return false;
  if (options.size) return isSizeAvailable(product, options.size, options.color);
  return options.color ? isColorAvailable(product, options.color) : isProductAvailable(product);
}
