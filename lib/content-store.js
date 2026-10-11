import fs from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { DEFAULT_CONTENT, normalizeContent } from '../app/content';

const CONTENT_ID = 'main';
const LOCAL_CONTENT_FILE = path.join(process.cwd(), 'data', 'site-content.json');

function hasDatabase() { return Boolean(process.env.DATABASE_URL); }
function database() {
  if (!globalThis.__gatariaSql) globalThis.__gatariaSql = neon(process.env.DATABASE_URL);
  return globalThis.__gatariaSql;
}
async function ensureTable() {
  if (!hasDatabase()) return;
  if (!globalThis.__gatariaContentTable) {
    const sql = database();
    globalThis.__gatariaContentTable = sql`CREATE TABLE IF NOT EXISTS gataria_site_content (id TEXT PRIMARY KEY, content JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  }
  await globalThis.__gatariaContentTable;
}
async function readLocalContent() {
  try { return JSON.parse(await fs.readFile(LOCAL_CONTENT_FILE, 'utf8')); }
  catch (error) {
    if (error?.code !== 'ENOENT') console.error('Falha ao ler o conteúdo local da Gataria.', error);
    return DEFAULT_CONTENT;
  }
}
export async function getSiteContent() {
  if (!hasDatabase()) return normalizeContent(await readLocalContent());
  await ensureTable();
  const rows = await database()`SELECT content FROM gataria_site_content WHERE id = ${CONTENT_ID} LIMIT 1`;
  return normalizeContent(rows[0]?.content || DEFAULT_CONTENT);
}
export async function saveSiteContent(content) {
  const normalized = normalizeContent(content);
  if (!hasDatabase()) {
    if (process.env.NODE_ENV === 'production') throw new Error('Configure DATABASE_URL para publicar alterações no CMS em produção.');
    await fs.mkdir(path.dirname(LOCAL_CONTENT_FILE), { recursive: true });
    await fs.writeFile(LOCAL_CONTENT_FILE, JSON.stringify(normalized, null, 2), 'utf8');
    return normalized;
  }
  await ensureTable();
  const json = JSON.stringify(normalized);
  await database()`INSERT INTO gataria_site_content (id, content, updated_at) VALUES (${CONTENT_ID}, ${json}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`;
  return normalized;
}
