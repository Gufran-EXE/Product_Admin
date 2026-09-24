'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, ProductFormData } from '@/types';
import { createProduct, updateProduct } from '@/lib/products';
import Spinner from '@/components/ui/Spinner';

interface ProductFormProps {
  product?: Product | null;
  onSuccess: (product: Product, isNew: boolean) => void;
  onCancel: () => void;
}

const EMPTY_FORM: ProductFormData = {
  title: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  rating: 0,
  thumbnail: '',
};

type FormErrors = Partial<Record<keyof ProductFormData, string>>;

function validate(data: ProductFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = 'Title is required';
  if (!data.description.trim()) errors.description = 'Description is required';
  if (!data.category.trim()) errors.category = 'Category is required';
  if (data.price <= 0) errors.price = 'Price must be greater than 0';
  if (data.stock < 0) errors.stock = 'Stock cannot be negative';
  if (data.rating < 0 || data.rating > 5) errors.rating = 'Rating must be 0–5';
  return errors;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const submitRef = useRef(false); // debounce guard

  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        rating: product.rating,
        thumbnail: product.thumbnail,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setApiError(null);
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current) return; // prevent double-submit

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    submitRef.current = true;
    setIsSubmitting(true);
    setApiError(null);

    try {
      let result: Product;
      if (isEdit && product) {
        result = await updateProduct(product.id, form);
        // DummyJSON returns updated fields merged — patch with local data
        result = { ...product, ...form, id: product.id };
      } else {
        result = await createProduct(form);
        // DummyJSON assigns a fake id > 194; we keep it
        result = { ...result, ...form };
      }
      onSuccess(result, !isEdit);
    } catch {
      setApiError('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
      submitRef.current = false;
    }
  };

  const Field = ({
    label,
    name,
    type = 'text',
    step,
    min,
    max,
    textarea,
  }: {
    label: string;
    name: keyof ProductFormData;
    type?: string;
    step?: string;
    min?: string;
    max?: string;
    textarea?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-cream-200 mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={form[name] as string}
          onChange={handleChange}
          rows={3}
          className={`input-field resize-none ${errors[name] ? 'error' : ''}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={form[name] as string | number}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          className={`input-field ${errors[name] ? 'error' : ''}`}
        />
      )}
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-box glass-card relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-cream-100">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onCancel} className="text-cream-300/50 hover:text-cream-100 transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Title *" name="title" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Description *" name="description" textarea />
              </div>
              <Field label="Category *" name="category" />
              <Field label="Thumbnail URL" name="thumbnail" type="url" />
              <Field label="Price ($) *" name="price" type="number" step="0.01" min="0" />
              <Field label="Stock *" name="stock" type="number" min="0" />
              <Field label="Rating (0–5)" name="rating" type="number" step="0.1" min="0" max="5" />
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/[0.06]">
              <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    Saving…
                  </>
                ) : (
                  isEdit ? 'Save Changes' : 'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
