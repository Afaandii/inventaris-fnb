import React from 'react';

/**
 * Skeleton Loader for Home DataTable Page (/master/outlets)
 */
export const OutletTableSkeleton: React.FC = () => {
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

        {/* Table Rows Skeleton (Desktop) */}
        <div className="hidden md:block space-y-3 pt-2">
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-12 w-full bg-muted/20 border border-border/40 rounded-xl"
            />
          ))}
        </div>

        {/* Card Rows Skeleton (Mobile) */}
        <div className="block md:hidden space-y-2.5 pt-2">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="h-14 w-full bg-muted/30 border border-border/40 rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Create / Edit Form Page (/master/outlets/create & /edit/:id)
 */
export const OutletFormSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-24 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-28 bg-muted/60 rounded-md" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-muted/80 rounded-xl" />
          <div className="h-3 w-64 bg-muted/50 rounded-md" />
        </div>
        <div className="h-10 w-28 bg-muted/60 rounded-xl" />
      </div>

      {/* Form Card Skeleton */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-7 space-y-6">
        {/* Name input */}
        <div className="space-y-2">
          <div className="h-3 w-32 bg-muted/60 rounded-md" />
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
        </div>

        {/* Code input */}
        <div className="space-y-2">
          <div className="h-3 w-28 bg-muted/60 rounded-md" />
          <div className="h-10 w-full bg-muted/30 rounded-xl" />
        </div>

        {/* City input */}
        <div className="space-y-2">
          <div className="h-3 w-28 bg-muted/60 rounded-md" />
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
        </div>

        {/* Address textarea */}
        <div className="space-y-2">
          <div className="h-3 w-36 bg-muted/60 rounded-md" />
          <div className="h-20 w-full bg-muted/40 rounded-xl" />
        </div>

        {/* Phone number */}
        <div className="space-y-2">
          <div className="h-3 w-32 bg-muted/60 rounded-md" />
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
        </div>

        {/* Operating Hours (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
        </div>

        {/* Status switch */}
        <div className="space-y-2">
          <div className="h-3 w-36 bg-muted/60 rounded-md" />
          <div className="h-10 w-full bg-muted/40 rounded-xl" />
        </div>

        {/* Bottom Buttons Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="h-11 w-28 bg-muted/50 rounded-xl" />
          <div className="h-11 w-40 bg-muted/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Detail Page (/master/outlets/detail/:id)
 */
export const OutletDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-24 bg-muted/60 rounded-md" />
        <div className="h-3 w-3 bg-muted/40 rounded-full" />
        <div className="h-3 w-28 bg-muted/60 rounded-md" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-2">
          <div className="h-7 w-60 bg-muted/80 rounded-xl" />
          <div className="h-3 w-48 bg-muted/50 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-36 bg-muted/80 rounded-xl" />
          <div className="h-10 w-24 bg-muted/60 rounded-xl" />
        </div>
      </div>

      {/* 4 Detail Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((c) => (
          <div
            key={c}
            className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6 space-y-4"
          >
            <div className="h-3 w-36 bg-muted/60 rounded-md border-b border-border/40 pb-2" />
            <div className="space-y-3 pt-2">
              <div className="h-4 w-3/4 bg-muted/40 rounded-md" />
              <div className="h-4 w-1/2 bg-muted/40 rounded-md" />
              <div className="h-4 w-2/3 bg-muted/40 rounded-md" />
            </div>
          </div>
        ))}

        {/* Card 5 Timestamps Skeleton */}
        <div className="md:col-span-2 rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6 space-y-3">
          <div className="h-3 w-32 bg-muted/60 rounded-md pb-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="h-4 w-3/4 bg-muted/40 rounded-md" />
            <div className="h-4 w-3/4 bg-muted/40 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
