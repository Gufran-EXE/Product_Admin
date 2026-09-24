export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  reviews?: Review[];
  brand?: string;
  discountPercentage?: number;
  tags?: string[];
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  image?: string;
}

export interface SortOption {
  field: 'price' | 'rating' | 'title';
  order: 'asc' | 'desc';
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  thumbnail: string;
}
