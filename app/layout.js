import './globals.css';
import { ContentProvider } from './content-context';
import { getSiteContent } from '../lib/content-store';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const content = await getSiteContent();
  return { title: content.seo.title, description: content.seo.description };
}
export default async function RootLayout({ children }) {
  const content = await getSiteContent();
  return <html lang="pt-BR"><body><ContentProvider initialContent={content}>{children}</ContentProvider></body></html>;
}
