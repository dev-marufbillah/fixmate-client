export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface overflow-hidden">
          <div className="skeleton-shimmer aspect-[16/10] rounded-none" />
          <div className="p-5 space-y-3">
            <div className="skeleton-shimmer h-4 w-2/3" />
            <div className="skeleton-shimmer h-3 w-1/2" />
            <div className="skeleton-shimmer h-3 w-3/4" />
            <div className="skeleton-shimmer h-9 w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card-surface p-4 space-y-3">
      <div className="skeleton-shimmer h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-shimmer h-12 w-full" />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="container-px py-16">
      <div className="skeleton-shimmer h-12 w-3/4 mx-auto" />
      <div className="skeleton-shimmer h-5 w-1/2 mx-auto mt-4" />
      <div className="skeleton-shimmer h-12 w-72 mx-auto mt-8 rounded-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-surface p-5 flex items-center gap-4">
            <div className="skeleton-shimmer w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-6 w-16" />
              <div className="skeleton-shimmer h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
