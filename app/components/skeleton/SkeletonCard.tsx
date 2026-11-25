export const SkeletonCard = () => (
  <div className="flex flex-col" aria-hidden="true">
    <div className="aspect-[4/5] w-full animate-pulse rounded-[22px] bg-surface-alt" />

    <div className="mt-2.5 space-y-2 px-1">
      <div className="h-3 w-4/5 animate-pulse rounded-full bg-surface-alt" />
      <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-surface-alt" />
    </div>
  </div>
);
