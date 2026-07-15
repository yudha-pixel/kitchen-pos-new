'use client';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div aria-hidden="true" className={`animate-pulse rounded-lg bg-surface-alt ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg bg-surface shadow-md">
    <Skeleton className="aspect-square rounded-none" />
    <div className="space-y-2 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  </div>
);
