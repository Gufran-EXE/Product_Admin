'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { fetchCategories, deleteProduct } from '@/lib/products';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import Pagination from '@/components/ui/Pagination';
import ProductTable from '@/components/products/ProductTable';
import ProductCard from '@/components/products/ProductCard';
import ProductForm from '@/components/products/ProductForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';

// ---------------------------------------------------------------------------
// URL param helpers
// ---------------------------------------------------------------------------
function safeInt(v: string | null, fallback: number, min = 1): number {
  const n = parseInt(v ?? '', 10);
  return isNaN(n) || n < min ? fallback : n;
}

function safePageSize(v: string | null): number {
  const n = parseInt(v ?? '', 10);
  return [10, 20, 50].includes(n) ? n : 10;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function ProductsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect unauthenticated users (sync auth — no loading state)
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  // ── URL state ──────────────────────────────────────────────────────────
  const page       = safeInt(searchParams.get('page'), 1);
  const pageSize   = safePageSize(searchParams.get('pageSize'));
  const searchQ    = searchParams.get('q') ?? '';
  const category   = searchParams.get('category') ?? 'all';
  const sortBy     = searchParams.get('sortBy') ?? '';
  const sortOrder  = (searchParams.get('order') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  // ── Local input state (search box value) ──────────────────────────────
  const [searchInput, setSearchInput] = useState(searchQ);
  const debouncedSearch = useDebounce(searchInput, 450);

  // ── Categories list ───────────────────────────────────────────────────
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // ── URL sync: when debounced search changes, update URL ───────────────
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedSearch === current) return;
    const p = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      p.set('q', debouncedSearch);
      p.set('category', 'all'); // clear category when searching
    } else {
      p.delete('q');
    }
    p.set('page', '1');
    router.replace(`/products?${p.toString()}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Fetch params ──────────────────────────────────────────────────────
  const fetchParams = useMemo(() => ({
    limit:    pageSize,
    skip:     (page - 1) * pageSize,
    search:   searchQ,
    category: category === 'all' ? undefined : category,
    sortBy:   sortBy || undefined,
    order:    sortOrder,
  }), [page, pageSize, searchQ, category, sortBy, sortOrder]);

  const { products, total, isLoading, error, refetch } = useProducts(fetchParams);

  // ── Optimistic local state ─────────────────────────────────────────────
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [localTotal, setLocalTotal] = useState(0);

  useEffect(() => {
    setLocalProducts(products);
    setLocalTotal(total);
  }, [products, total]);

  // ── Modal state ───────────────────────────────────────────────────────
  const [formProduct, setFormProduct] = useState<Product | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────
  const pushParams = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    router.replace(`/products?${p.toString()}`);
  }, [searchParams, router]);

  const handlePageChange = (p: number) => pushParams({ page: String(p) });
  const handlePageSizeChange = (s: number) => pushParams({ pageSize: String(s), page: '1' });
  const handleCategoryChange = (cat: string) => {
    setSearchInput('');
    pushParams({ category: cat, page: '1', q: '' });
  };
  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    pushParams({ sortBy: field, order: newOrder, page: '1' });
  };

  const handleFormSuccess = (saved: Product, isNew: boolean) => {
    setFormProduct(undefined);
    if (isNew) {
      setLocalProducts((prev) => [saved, ...prev]);
      setLocalTotal((prev) => prev + 1);
    } else {
      setLocalProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      // Optimistic remove
      setLocalProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setLocalTotal((prev) => Math.max(0, prev - 1));
    } catch {
      // API call failed (DummyJSON always succeeds for fake deletes) — still remove optimistically
      setLocalProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setLocalTotal((prev) => Math.max(0, prev - 1));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(localTotal / pageSize));

  return (
    <>
      <Navbar />

      <main className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-cream-100">Products</h1>
            <p className="text-sm text-cream-300/50 mt-0.5">
              {isLoading ? 'Loading…' : `${localTotal} products total`}
            </p>
          </div>
          <button
            className="btn-primary self-start sm:self-auto"
            onClick={() => setFormProduct(null)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Filters row */}
        <div className="glass-card !hover:transform-none p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap"
          style={{ transform: 'none' }}>
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-300/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field !pl-9"
            />
          </div>

          {/* Category */}
          <select
            className="input-field !w-auto"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={!!searchQ}
            title={searchQ ? 'Clear search to use category filter' : undefined}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="input-field !w-auto"
            value={sortBy ? `${sortBy}_${sortOrder}` : ''}
            onChange={(e) => {
              const [field, ord] = e.target.value.split('_');
              if (!field) {
                pushParams({ sortBy: '', order: '' });
              } else {
                pushParams({ sortBy: field, order: ord, page: '1' });
              }
            }}
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating_desc">Rating: Best first</option>
            <option value="rating_asc">Rating: Lowest first</option>
            <option value="title_asc">Title: A → Z</option>
            <option value="title_desc">Title: Z → A</option>
          </select>

          {/* Active search note */}
          {searchQ && category !== 'all' && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400/80 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              Category filter disabled during search
            </div>
          )}
        </div>

        {/* Content area */}
        {error ? (
          <div className="glass-card p-12 text-center" style={{ transform: 'none' }}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-cream-100 mb-2">Failed to load products</h3>
            <p className="text-cream-300/50 text-sm mb-5">{error}</p>
            <button className="btn-primary" onClick={refetch}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        ) : isLoading ? (
          /* Skeleton loading */
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block rounded-xl border border-white/[0.06] overflow-hidden mb-4">
              <div className="p-4 space-y-3">
                {Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="skeleton w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 skeleton h-4 rounded" />
                    <div className="skeleton w-24 h-4 rounded" />
                    <div className="skeleton w-16 h-4 rounded" />
                    <div className="skeleton w-20 h-4 rounded" />
                    <div className="skeleton w-12 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card overflow-hidden" style={{ transform: 'none' }}>
                  <div className="skeleton h-44" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 rounded w-1/3" />
                    <div className="skeleton h-4 rounded w-full" />
                    <div className="skeleton h-4 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : localProducts.length === 0 ? (
          <div className="glass-card p-16 text-center" style={{ transform: 'none' }}>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-cream-100 mb-2">No products found</h3>
            <p className="text-cream-300/50 text-sm">
              {searchQ ? `No results for "${searchQ}"` : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block mb-4">
              <ProductTable
                products={localProducts}
                onEdit={(p) => setFormProduct(p)}
                onDelete={(p) => setDeleteTarget(p)}
                sortBy={sortBy}
                order={sortOrder}
                onSort={handleSort}
              />
            </div>
            {/* Mobile cards */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {localProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={(p) => setFormProduct(p)}
                  onDelete={(p) => setDeleteTarget(p)}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!isLoading && !error && localProducts.length > 0 && (
          <div className="glass-card p-4 mt-2" style={{ transform: 'none' }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              total={localTotal}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {formProduct !== undefined && (
        <ProductForm
          product={formProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormProduct(undefined)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
