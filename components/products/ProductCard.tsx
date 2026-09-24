'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import StarRating from '@/components/ui/StarRating';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const lowStock = product.stock < 10;

  return (
    <div className="glass-card relative overflow-hidden flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative h-44 overflow-hidden rounded-t-xl group">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/222636/d4bc9a?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent" />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <span className="badge badge-amber self-start">{product.category}</span>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-cream-100 text-sm leading-snug line-clamp-2 hover:text-amber-400 transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-amber-400 font-bold text-base">${product.price.toFixed(2)}</span>
          <StarRating rating={product.rating} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${lowStock ? 'text-red-400' : 'text-green-400/80'}`}>
            {lowStock ? '⚠ Low stock' : '✓ In stock'} ({product.stock})
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 btn-secondary !py-1.5 !text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 btn-danger !py-1.5 !text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
