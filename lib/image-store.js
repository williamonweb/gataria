import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
async function sqlClient() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS gataria_images (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL)`;
  return sql;
}
export async function saveImage(dataUrl) {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!match) throw new Error('Formato de imagem inválido. Use PNG, JPG, WebP ou GIF.');
  if (Buffer.byteLength(dataUrl) > 3500000) throw new Error('Esta foto é muito grande. Use uma imagem menor.');
  const [, mime, data] = match;
  const id = createHash('sha256').update(dataUrl).digest('hex');
  if (process.env.DATABASE_URL) {
    const sql = await sqlClient();
    await sql`INSERT INTO gataria_images (id, mime, data) VALUES (${id}, ${mime}, ${data}) ON CONFLICT (id) DO NOTHING`;
  } else {
    if (process.env.NODE_ENV === 'production') throw new Error('Configure DATABASE_URL para salvar as fotos.');
    const dir = path.join(process.cwd(), 'data', 'images');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, id + '.json'), JSON.stringify({ mime, data }));
  }
  return '/api/images/' + id;
}
export async function readImage(id) {
  if (!/^[a-f0-9]{64}$/.test(id)) return null;
  if (process.env.DATABASE_URL) {
    const sql = await sqlClient();
    const rows = await sql`SELECT mime, data FROM gataria_images WHERE id = ${id}`;
    return rows[0] || null;
  }
  try { return JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'images', id + '.json'), 'utf8')); }
  catch { return null; }
}
