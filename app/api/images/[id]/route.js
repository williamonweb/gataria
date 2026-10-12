import { readImage } from '../../../../lib/image-store';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const image = await readImage(id);
    if (!image) return new Response('Imagem não encontrada', { status: 404 });
    return new Response(Buffer.from(image.data, 'base64'), { headers: { 'Content-Type': image.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response('Não foi possível carregar a imagem', { status: 500 }); }
}
