import React from "react";

export const UserTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted/60 rounded-md" />
          <div className="h-8 w-56 bg-muted/80 rounded-xl" />
          <div className="h-4 w-72 bg-muted/50 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-muted/60" />
          <div className="w-36 h-10 rounded-xl bg-muted/70" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card/60 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-muted/60 rounded" />
              <div className="w-8 h-8 rounded-xl bg-muted/60" />
            </div>
            <div className="h-7 w-16 bg-muted/80 rounded" />
          </div>
        ))}
      </div>

      {/* Table Container Skeleton */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/50">
          <div className="h-8 w-36 bg-muted/60 rounded-lg" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-48 bg-muted/60 rounded-lg" />
            <div className="h-8 w-20 bg-muted/60 rounded-lg" />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-muted/40 rounded-xl border border-border/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const UserFormSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-pulse">
      {/* Breadcrumb & Header */}
      <div className="h-4 w-40 bg-muted/60 rounded" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted/80 rounded-xl" />
          <div className="h-4 w-64 bg-muted/50 rounded" />
        </div>
        <div className="h-10 w-28 bg-muted/60 rounded-xl" />
      </div>

      {/* Form Fields 12-cols Skeleton */}
      <div className="rounded-2xl border border-border/70 bg-card/60 p-6 space-y-6">
        <div className="space-y-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-32 bg-muted/60 rounded" />
              <div className="h-10 w-full bg-muted/40 rounded-xl border border-border/40" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <div className="h-10 w-24 bg-muted/60 rounded-xl" />
          <div className="h-10 w-28 bg-muted/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const UserDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-44 bg-muted/60 rounded" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted/70" />
          <div className="space-y-2">
            <div className="h-7 w-48 bg-muted/80 rounded-lg" />
            <div className="h-4 w-32 bg-muted/50 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-muted/70 rounded-xl" />
          <div className="h-10 w-24 bg-muted/60 rounded-xl" />
        </div>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card/60 p-5 space-y-4"
          >
            <div className="h-4 w-32 bg-muted/60 rounded" />
            <div className="space-y-2.5">
              <div className="h-3.5 w-24 bg-muted/40 rounded" />
              <div className="h-5 w-40 bg-muted/60 rounded" />
              <div className="h-3.5 w-20 bg-muted/40 rounded" />
              <div className="h-5 w-36 bg-muted/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
