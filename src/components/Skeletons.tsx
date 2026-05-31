export function JobCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-border bg-card p-5">
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
      <div className="mt-6 flex justify-between">
        <div className="h-8 w-16 rounded bg-muted" />
        <div className="h-8 w-20 rounded bg-muted" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return <div className="h-28 animate-pulse rounded-2xl border border-border bg-card" />;
}
