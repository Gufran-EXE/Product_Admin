'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import StarRating from '@/components/ui/StarRating';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  sortBy: string;
  order: 'asc' | 'desc';
  onSort: (field: string) => void;
}

function SortIcon({ field, sortBy, order }: { field: string; sortBy: string; order: 'asc' | 'desc' }) {
  if (field !== sortBy) return <span className="ml-1 text-cream-300/20">⇅</span>;
  return <span className="ml-1 text-amber-400">{order === 'asc' ? '↑' : '↓'}</span>;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  sortBy,
  order,
  onSort,
}: ProductTableProps) {
  const SortTh = ({ field, label }: { field: string; label: string }) => (
    <th
      className="cursor-pointer select-none hover:text-amber-400 transition-colors duration-150"
      onClick={() => onSort(field)}
    >
      {label}
      <SortIcon field={field} sortBy={sortBy} order={order} />
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-16">Image</th>
            <SortTh field="title" label="Title" />
            <th>Category</th>
            <SortTh field="price" label="Price" />
            <SortTh field="rating" label="Rating" />
            <th>Stock</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={p.thumbnail}
                    alt={p.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/222636/d4bc9a?text=?';
                    }}
                  />
                </div>
              </td>
              <td>
                <Link
                  href={`/products/${p.id}`}
                  className="font-medium text-cream-100 hover:text-amber-400 transition-colors duration-150 line-clamp-2 max-w-xs"
                >
                  {p.title}
                </Link>
              </td>
              <td>
                <span className="badge badge-amber">{p.category}</span>
              </td>
              <td className="font-semibold text-amber-400">${p.price.toFixed(2)}</td>
              <td><StarRating rating={p.rating} /></td>
              <td>
                <span className={`font-medium text-sm ${p.stock < 10 ? 'text-red-400' : 'text-green-400/80'}`}>
                  {p.stock}
                </span>
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="btn-secondary !py-1.5 !px-3 !text-xs"
                    aria-label={`Edit ${p.title}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="btn-danger !py-1.5 !px-3 !text-xs"
                    aria-label={`Delete ${p.title}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
