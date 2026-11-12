import React from 'react';

/**
 * Skeleton Loader for Home DataTable Page (/master/warehouses)
 */
export const WirehouseTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-28 bg-muted/60 rounded-md" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/80 rounded-xl" />
          <div className="h-3 w-72 bg-muted/50 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-muted/60 rounded-xl" />
          <div className="h-10 w-36 bg-muted/80 rounded-xl" />
        </div>
      </div>

      {/* Stat Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-border/50 bg-card/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-muted/60 rounded-md" />
              <div className="w-8 h-8 rounded-xl bg-muted/50" />
            </div>
            <div className="h-8 w-16 bg-muted/80 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Container Skeleton */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 space-y-4">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="h-9 w-36 bg-muted/50 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-full sm:w-64 bg-muted/50 rounded-xl" />
            <div className="h-9 w-20 bg-muted/50 rounded-xl" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-card/40"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 bg-muted/60 rounded-md" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-muted/80 rounded-md" />
                  <div className="h-3 w-24 bg-muted/50 rounded-md" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-8">
                <div className="h-4 w-28 bg-muted/60 rounded-md" />
                <div className="h-4 w-20 bg-muted/60 rounded-md" />
                <div className="h-6 w-16 bg-muted/70 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-8 w-8 bg-muted/60 rounded-lg" />
                <div className="h-8 w-8 bg-muted/60 rounded-lg" />
                <div className="h-8 w-8 bg-muted/60 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Create & Edit Form (/master/warehouses/create & /edit/:id)
 */
export const WirehouseFormSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-28 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-24 bg-muted/60 rounded-md" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-muted/80 rounded-xl" />
          <div className="h-3 w-80 bg-muted/50 rounded-md" />
        </div>
        <div className="h-10 w-28 bg-muted/60 rounded-xl" />
      </div>

      {/* Form Skeleton */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-6 space-y-6">
        <div className="space-y-5">
          {[1, 2, 3, 4, 5, 6, 7].map((f) => (
            <div key={f} className="space-y-2">
              <div className="h-3.5 w-32 bg-muted/70 rounded-md" />
              <div className="h-10 w-full bg-muted/50 rounded-xl" />
            </div>
          ))}
          <div className="space-y-2">
            <div className="h-3.5 w-32 bg-muted/70 rounded-md" />
            <div className="h-10 w-full bg-muted/40 rounded-xl" />
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <div className="h-11 w-28 bg-muted/60 rounded-xl" />
          <div className="h-11 w-36 bg-muted/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Detail Page (/master/warehouses/detail/:id)
 */
export const WirehouseDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-28 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-24 bg-muted/60 rounded-md" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-60 bg-muted/80 rounded-xl" />
            <div className="h-6 w-20 bg-muted/60 rounded-full" />
          </div>
          <div className="h-3.5 w-52 bg-muted/50 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-36 bg-muted/80 rounded-xl" />
          <div className="h-10 w-24 bg-muted/60 rounded-xl" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="rounded-2xl border border-border/70 bg-card/60 p-5 space-y-4"
          >
            <div className="h-3.5 w-36 bg-muted/70 rounded-md" />
            <div className="space-y-3">
              <div className="h-3 w-20 bg-muted/50 rounded-md" />
              <div className="h-5 w-48 bg-muted/80 rounded-md" />
              <div className="h-3 w-24 bg-muted/50 rounded-md" />
              <div className="h-5 w-36 bg-muted/80 rounded-md" />
            </div>
          </div>
        ))}
        <div className="col-span-1 md:col-span-2 rounded-2xl border border-border/70 bg-card/60 p-5 space-y-4">
          <div className="h-3.5 w-36 bg-muted/70 rounded-md" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 w-40 bg-muted/60 rounded-md" />
            <div className="h-4 w-40 bg-muted/60 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
