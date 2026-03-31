export default function ErrorState({ message, onRetry, compact = false }) {
  const msg = message ?? 'Failed to load data. Check your FRED API key.'

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-rose-400 px-1 py-2">
        <span>⚠</span>
        <span>{msg}</span>
        {onRetry && (
          <button onClick={onRetry} className="underline hover:no-underline">
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-rose-900/30 flex items-center justify-center text-rose-400 text-lg">
        ⚠
      </div>
      <div>
        <p className="text-sm font-medium text-slate-300">Data unavailable</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{msg}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-raised
                     text-slate-300 hover:text-white hover:bg-surface-muted transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
