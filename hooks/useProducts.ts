import { useCallback, useEffect, useRef, useState } from 'react';
import { Product, ProductsResponse } from '@/types';
import { fetchProducts, FetchProductsParams } from '@/lib/products';

interface UseProductsResult {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(params: FetchProductsParams): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AbortController ref to cancel stale requests (race-condition guard)
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data: ProductsResponse = await fetchProducts(params);
      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        setProducts(data.products);
        setTotal(data.total);
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return; // stale request — ignore
      const message =
        err instanceof Error ? err.message : 'Failed to load products.';
      setError(message);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.limit,
    params.skip,
    params.search,
    params.category,
    params.sortBy,
    params.order,
  ]);

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  return { products, total, isLoading, error, refetch: load };
}
