'use client';
import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_CONTENT, normalizeContent } from './content';
const ContentContext = createContext(DEFAULT_CONTENT);
export function ContentProvider({ initialContent, children }) {
  const value = useMemo(() => normalizeContent(initialContent), [initialContent]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
export function useSiteContent() { return useContext(ContentContext); }
