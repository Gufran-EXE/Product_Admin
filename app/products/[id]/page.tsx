'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { fetchProductById } from '@/lib/products';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import StarRating from '@/components/ui/StarRating';
import Spinner from '@/components/ui/Spinner';
import ProductForm from '@/components/products/ProductForm';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  // Redirect unauthenticated users — authLoading is always false now (sync init)
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  // Fetch product immediately — do NOT gate on authLoading (it's always false)
  useEffect(() => {
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId < 1) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    fetchProductById(numId)
      .then((data) => {
        setProduct(data);
        setActiveImage(0);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError('Failed to load product details.');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="page-enter max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="glass-card inline-block p-12" style={{ transform: 'none' }}>
            <div className="text-7xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold text-cream-100 mb-2">Product Not Found</h1>
            <p className="text-cream-300/60 mb-8">
              The product ID <span className="font-mono text-amber-400">#{id}</span> doesn&apos;t exist.
            </p>
            <Link href="/products" className="btn-primary">
              ← Back to Products
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="page-enter max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="glass-card inline-block p-12" style={{ transform: 'none' }}>
            <h1 className="text-xl font-bold text-cream-100 mb-2">Something went wrong</h1>
            <p className="text-cream-300/60 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button className="btn-primary" onClick={() => window.location.reload()}>
                Retry
              </button>
              <Link href="/products" className="btn-secondary">
                ← Back
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail];

  return (
    <>
      <Navbar />

      <main className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-cream-300/50 mb-6">
          <Link href="/products" className="hover:text-amber-400 transition-colors">Products</Link>
          <span>›</span>
          <span className="text-cream-200 truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06] bg-charcoal-800">
              <Image
                src={images[activeImage] ?? product.thumbnail}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4 transition-opacity duration-300"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/222636/d4bc9a?text=No+Image';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      i === activeImage
                        ? 'border-amber-500 shadow-lg shadow-amber-500/25'
                        : 'border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/222636/d4bc9a?text=?';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            <div>
              <span className="badge badge-amber text-xs">{product.category}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-cream-100 mt-2 mb-1">
                {product.title}
              </h1>
              {product.brand && (
                <p className="text-cream-300/50 text-sm">by {product.brand}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <StarRating rating={product.rating} />
              <span className="text-cream-300/40 text-sm">
                {product.reviews?.length ?? 0} reviews
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-amber-400">${product.price.toFixed(2)}</span>
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="badge badge-teal">-{product.discountPercentage.toFixed(0)}% off</span>
              )}
            </div>

            <p className="text-cream-200/80 leading-relaxed">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-800/50 border border-white/[0.05]">
              <div className={`w-2.5 h-2.5 rounded-full ${product.stock < 10 ? 'bg-red-400' : 'bg-green-400'} animate-pulse`} />
              <span className="text-sm text-cream-200">
                {product.stock < 10
                  ? `Only ${product.stock} left in stock`
                  : `${product.stock} in stock`}
              </span>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge badge-teal">{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1" onClick={() => setShowEdit(true)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Product
              </button>
              <Link href="/products" className="btn-secondary">
                ← Back
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-cream-100 mb-4">
              Customer Reviews <span className="text-cream-300/40 font-normal text-base">({product.reviews.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map((review, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-cream-100 text-sm">{review.reviewerName}</p>
                      <p className="text-cream-300/40 text-xs mt-0.5">
                        {new Date(review.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-cream-200/70 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Edit form */}
      {showEdit && (
        <ProductForm
          product={product}
          onSuccess={(updated) => {
            setProduct(updated);
            setShowEdit(false);
          }}
          onCancel={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
