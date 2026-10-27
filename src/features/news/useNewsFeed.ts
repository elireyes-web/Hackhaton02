import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api'; 

export interface NewsItem {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: 'RUMOR' | 'CONFIRMED' | 'DEBUNKED';
  content: string;
  createdAt: string;
}

interface FeedResponse {
  items: NewsItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function useNewsFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cursorRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const type = searchParams.get('type') || '';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';

  const fetchNews = useCallback(async (reset: boolean = false) => {
    if (isFetchingRef.current && !reset) return;
    
    if (reset) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      cursorRef.current = null;
    } else if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (priority) params.set('priority', priority);
      if (status) params.set('status', status);
      if (cursorRef.current && !reset) params.set('cursor', cursorRef.current);
      params.set('limit', '20');

      const data = await apiFetch<FeedResponse>(`/news/feed?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      });

      setItems(prev => {
        if (reset) return data.items;
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = data.items.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });

      cursorRef.current = data.nextCursor;
      setHasMore(data.hasMore);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Error al cargar noticias');
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [type, priority, status]);

  useEffect(() => {
    fetchNews(true);
    return () => abortControllerRef.current?.abort();
  }, [fetchNews]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
        fetchNews(false);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, fetchNews]);

  const updateFilters = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  return { items, setItems, hasMore, isLoading, error, lastElementRef, updateFilters, fetchNews };
}