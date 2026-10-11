import { createHash, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'gataria_admin_session';
export function cmsPassword() {
  if (process.env.CMS_PASSWORD) return process.env.CMS_PASSWORD;
  return process.env.NODE_ENV === 'production' ? '' : 'gataria-admin';
}
function expectedToken() {
  const password = cmsPassword();
  const secret = process.env.CMS_SECRET || password;
  if (!password || !secret) return '';
  return createHash('sha256').update(`gataria-cms:${password}:${secret}`).digest('hex');
}
export function createAdminToken() { return expectedToken(); }
export function validAdminToken(candidate = '') {
  const expected = expectedToken();
  if (!candidate || !expected || candidate.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}
export function validPassword(candidate = '') {
  const expected = cmsPassword();
  if (!candidate || !expected || candidate.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}
