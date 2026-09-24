import api from './axios';
import { Product, ProductFormData, ProductsResponse } from '@/types';

export interface FetchProductsParams {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Fetch paginated products.
 * NOTE: DummyJSON cannot search and filter by category simultaneously.
 * When a search query is present we use /products/search and ignore category.
 * When a category is selected (and no search) we use /products/category/:slug.
 * We apply sort client-side because the category endpoint returns all items.
 */
export async function fetchProducts(params: FetchProductsParams): Promise<ProductsResponse> {
  const { limit = 10, skip = 0, search, category, sortBy, order = 'asc' } = params;

  let response;

  if (search && search.trim()) {
    // Search mode — ignore category filter
    response = await api.get<ProductsResponse>('/products/search', {
      params: { q: search.trim(), limit, skip },
    });
  } else if (category && category !== 'all') {
    // Category filter mode — fetch all for that category then slice manually
    const catResponse = await api.get<ProductsResponse>(`/products/category/${category}`, {
      params: { limit: 0 }, // get all
    });
    let products = catResponse.data.products;

    // Sort
    if (sortBy) {
      products = sortProducts(products, sortBy, order);
    }

    const total = products.length;
    const sliced = products.slice(skip, skip + limit);

    return { products: sliced, total, skip, limit };
  } else {
    // Default listing
    response = await api.get<ProductsResponse>('/products', {
      params: { limit, skip, sortBy, order },
    });
  }

  return response.data;
}

export async function fetchProductById(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function fetchCategories(): Promise<{ slug: string; name: string; url: string }[]> {
  const response = await api.get<{ slug: string; name: string; url: string }[]>('/products/categories');
  return response.data;
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const response = await api.post<Product>('/products/add', data);
  return response.data;
}

export async function updateProduct(id: number, data: Partial<ProductFormData>): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean }> {
  const response = await api.delete<{ id: number; isDeleted: boolean }>(`/products/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Client-side helpers
// ---------------------------------------------------------------------------

function sortProducts(products: Product[], field: string, order: 'asc' | 'desc'): Product[] {
  return [...products].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    if (field === 'price') { aVal = a.price; bVal = b.price; }
    else if (field === 'rating') { aVal = a.rating; bVal = b.rating; }
    else if (field === 'title') { aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); }

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
