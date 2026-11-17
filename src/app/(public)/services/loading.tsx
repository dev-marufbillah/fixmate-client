import { CardGridSkeleton } from "@/components/ui/Skeletons";

export default function ServicesLoading() {
  return (
    <div className="container-px py-10 md:py-14">
      <div className="skeleton-shimmer h-9 w-72 mb-3" />
      <div className="skeleton-shimmer h-4 w-96 max-w-full mb-8" />
      <div className="card-surface p-5 mb-8 space-y-3">
        <div className="skeleton-shimmer h-11 w-full" />
        <div className="skeleton-shimmer h-4 w-40" />
      </div>
      <CardGridSkeleton count={9} />
    </div>
  );
}
