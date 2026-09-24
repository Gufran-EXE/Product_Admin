'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [10, 20, 50];

export default function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  // Build page numbers to display (always show first, last, current ± 1)
  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2">
      {/* Info text */}
      <p className="text-sm text-cream-300/60 order-2 sm:order-1">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2 order-1 sm:order-2 flex-wrap justify-center">
        {/* Page size */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-cream-300/50 whitespace-nowrap">Per page:</label>
          <select
            className="input-field !w-auto !py-1.5 !px-2 text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Prev */}
        <button
          className="btn-secondary !py-1.5 !px-3 text-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`el-${i}`} className="px-1 text-cream-300/30 text-sm select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150 ${
                  p === currentPage
                    ? 'bg-amber-500 text-charcoal-950 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-charcoal-800 text-cream-200 hover:bg-charcoal-700 hover:text-amber-400 border border-white/[0.06]'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          className="btn-secondary !py-1.5 !px-3 text-sm"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
