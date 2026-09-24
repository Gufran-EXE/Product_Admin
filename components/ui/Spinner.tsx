interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${sizes[size]} ${className} animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500`}
      role="status"
      aria-label="Loading"
    />
  );
}
