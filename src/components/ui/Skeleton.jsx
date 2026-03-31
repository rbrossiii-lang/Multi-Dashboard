import clsx from 'clsx'

export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-surface-raised',
        className,
      )}
    />
  )
}

export function SkeletonCard({ h = 'h-48', className }) {
  return (
    <div className={clsx('card', className)}>
      <Skeleton className="h-4 w-32 mb-3" />
      <Skeleton className={h} />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function ChartSkeleton({ h = 'h-56', title }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        {title
          ? <p className="text-sm font-semibold text-slate-100">{title}</p>
          : <Skeleton className="h-4 w-40" />
        }
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className={clsx(h, 'w-full')} />
    </div>
  )
}
