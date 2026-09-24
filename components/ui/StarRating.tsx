interface StarRatingProps {
  rating: number;
  max?: number;
}

export default function StarRating({ rating, max = 5 }: StarRatingProps) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span key={i} className="relative text-base leading-none">
            <span className="star-empty">★</span>
            {(filled || partial) && (
              <span
                className="star absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${(rating % 1) * 100}%` }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
      <span className="ml-1 text-xs text-amber-400/80 font-medium">{rating.toFixed(1)}</span>
    </span>
  );
}
