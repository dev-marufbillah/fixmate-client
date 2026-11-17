import { CardGridSkeleton, HeroSkeleton } from "@/components/ui/Skeletons";

export default function PublicLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="container-px pb-16">
        <div className="skeleton-shimmer h-8 w-64 mb-8" />
        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}
