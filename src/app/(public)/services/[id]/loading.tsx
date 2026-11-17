export default function ServiceDetailsLoading() {
  return (
    <div className="container-px py-8 md:py-12">
      <div className="skeleton-shimmer h-4 w-64 mb-6" />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="skeleton-shimmer h-64 md:h-96 w-full rounded-2xl" />
          <div className="skeleton-shimmer h-8 w-3/4" />
          <div className="skeleton-shimmer h-4 w-full" />
          <div className="skeleton-shimmer h-4 w-5/6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="skeleton-shimmer h-80 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
