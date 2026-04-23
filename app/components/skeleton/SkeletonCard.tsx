export const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-3 md:p-4 shadow-sm">
    <div className="h-[140px] md:h-[220px] bg-gray-200 animate-pulse rounded-xl" />

    <div className="mt-3 space-y-2">
      <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded" />
      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
    </div>
  </div>
);
