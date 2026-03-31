import { fmt } from '@/utils/formatters'

/**
 * Shared dark-theme Recharts tooltip.
 *
 * Props forwarded by Recharts: active, payload, label
 * Custom props:
 *   labelFmt   — (label) => string for the date label
 *   valueFmt   — (value) => string for each series value
 */
export default function ChartTooltip({
  active,
  payload,
  label,
  labelFmt,
  valueFmt,
}) {
  if (!active || !payload?.length) return null

  const dateStr = labelFmt ? labelFmt(label) : fmt.date(label)

  return (
    <div className="chart-tooltip min-w-[130px]">
      <p className="text-slate-400 font-medium mb-1.5 border-b border-surface-muted pb-1">
        {dateStr}
      </p>
      <div className="space-y-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-semibold" style={{ color: entry.color }}>
              {valueFmt ? valueFmt(entry.value) : entry.value?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
