export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function StatisticsCardSkeleton() {
  return (
    <div className="w-full max-w-[1091px] bg-white rounded-lg p-6 border border-[#EAECF0]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full max-w-[1041px] bg-white rounded-lg border border-[#EAECF0]">
      {/* Header */}
      <div className="h-[44px] bg-[#F9FAFB] border-b border-[#EAECF0] px-6 flex items-center gap-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-[72px] border-b border-[#EAECF0] px-6 flex items-center gap-4"
        >
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export function BranchDetailsStatisticsSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg p-6 border border-[#E5E7EB]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BranchInfoCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg p-6 border border-[#E5E7EB]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 pl-[58px] pr-6 pt-6">
        <div className="max-w-[1200px]">
          {/* Header */}
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <BranchDetailsStatisticsSkeleton />
          </div>

          {/* Info Card */}
          <div className="mb-8">
            <BranchInfoCardSkeleton />
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-36" />
          </div>

          {/* Table */}
          <TableSkeleton rows={8} />
        </div>
      </main>
    </div>
  );
}
