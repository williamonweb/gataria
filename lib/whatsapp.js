export function normalizeWhatsAppNumber(value = '') {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

export function whatsappUrl(contact = {}, message = '') {
  const number = normalizeWhatsAppNumber(contact.whatsapp);
  if (!number) return '';
  const text = message || contact.whatsappMessage || 'Olá! Gostaria de conhecer as camisetas da Gataria.';
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function productWhatsappUrl(contact, product, options = {}) {
  if (!product) return whatsappUrl(contact);
  const details = [
    contact?.whatsappMessage || 'Olá! Vi este produto no site da Gataria e gostaria de saber mais:',
    `*${product.name}*`,
    product.sku ? `Código: ${product.sku}` : '',
    options.model ? `Modelo: ${options.model}` : '',
    options.color ? `Cor: ${options.color}` : '',
    options.size ? `Tamanho: ${options.size}` : '',
    product.price ? `Preço exibido: R$ ${product.price}` : '',
  ].filter(Boolean);
  return whatsappUrl(contact, details.join('\n'));
}
