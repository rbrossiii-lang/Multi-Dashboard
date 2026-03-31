import { fmt, getPercentileBgClass } from '@/utils/formatters'
import clsx from 'clsx'

/**
 * Compact stat display showing current value, 1Y change, and 10Y percentile rank.
 */
export default function StatCard({
  label,
  value,
  unit = '',
  change1Y,
  percentile10Y,
  lowerBetter = false,
  changeUnit = 'pp',
  compact = false,
}) {
  const pctClass  = getPercentileBgClass(percentile10Y, lowerBetter)
  const isPositive = change1Y != null && change1Y >= 0

  // For lowerBetter indicators, higher values = worse, so flip delta color
  const deltaGood = lowerBetter ? !isPositive : isPositive

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-400">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-slate-100">
            {value != null ? `${Number(value).toFixed(1)}${unit}` : '—'}
          </span>
          {change1Y != null && (
            <span className={deltaGood ? 'text-emerald-400' : 'text-rose-400'}>
              {change1Y >= 0 ? '+' : ''}{change1Y.toFixed(1)}{changeUnit}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Current value */}
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value mt-1">
          {value != null ? `${Number(value).toFixed(1)}${unit}` : '—'}
        </p>
      </div>

      {/* 1Y change + percentile */}
      <div className="flex items-center gap-2">
        {change1Y != null && (
          <span
            className={clsx(
              'badge text-xs',
              deltaGood ? 'badge-green' : 'badge-red',
            )}
          >
            {change1Y >= 0 ? '▲' : '▼'}&nbsp;
            {Math.abs(change1Y).toFixed(2)}{changeUnit} 1Y
          </span>
        )}
        {percentile10Y != null && (
          <span className={clsx('badge text-xs', pctClass)}>
            {Math.round(percentile10Y)}th pct
          </span>
        )}
      </div>
    </div>
  )
}
