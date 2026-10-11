'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_CONTENT, normalizeContent } from './content';
const ContentContext = createContext(DEFAULT_CONTENT);
export function ContentProvider({ initialContent, children }) {
  const [value, setValue] = useState(() => normalizeContent(initialContent));
  const serialized = useRef(JSON.stringify(normalizeContent(initialContent)));
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    let stopped = false;
    let busy = false;
    const controller = new AbortController();
    async function refresh() {
      if (busy || document.visibilityState === 'hidden') return;
      busy = true;
      try {
        const response = await fetch('/api/content', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!data.content || stopped) return;
        const next = normalizeContent(data.content);
        const json = JSON.stringify(next);
        if (json !== serialized.current) {
          serialized.current = json;
          setValue(next);
        }
      } catch { /* Preserve the last successful catalog during connection failures. */ }
      finally { busy = false; }
    }
    refresh();
    const timer = window.setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('gataria:published', refresh);
    function onStorage(event) { if (event.key === 'gataria:published') refresh(); }
    window.addEventListener('storage', onStorage);
    return () => {
      stopped = true;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('gataria:published', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [pathname]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
export function useSiteContent() { return useContext(ContentContext); }
