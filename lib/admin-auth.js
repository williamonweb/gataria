import { createHash, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'gataria_admin_session';
export function cmsUsername() {
  if (process.env.CMS_USERNAME) return process.env.CMS_USERNAME.trim();
  return process.env.NODE_ENV === 'production' ? '' : 'admin';
}
export function cmsPassword() {
  if (process.env.CMS_PASSWORD) return process.env.CMS_PASSWORD;
  return process.env.NODE_ENV === 'production' ? '' : 'gataria-admin';
}
function expectedToken() {
  const username = cmsUsername();
  const password = cmsPassword();
  const secret = process.env.CMS_SECRET || password;
  if (!username || !password || !secret) return '';
  return createHash('sha256').update(`gataria-cms:${username}:${password}:${secret}`).digest('hex');
}
function safeEqual(candidate = '', expected = '') {
  if (!candidate || !expected) return false;
  const candidateHash = createHash('sha256').update(String(candidate)).digest();
  const expectedHash = createHash('sha256').update(String(expected)).digest();
  return timingSafeEqual(candidateHash, expectedHash);
}
export function createAdminToken() { return expectedToken(); }
export function validAdminToken(candidate = '') {
  return safeEqual(candidate, expectedToken());
}
export function validUsername(candidate = '') {
  return safeEqual(String(candidate).trim(), cmsUsername());
}
export function validPassword(candidate = '') {
  return safeEqual(candidate, cmsPassword());
}
