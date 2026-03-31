import { computePressure, buildInterpretation } from '@/utils/fredHelpers'
import { useMemo } from 'react'

const CONFIG = {
  accelerating: {
    icon:  '↑',
    label: 'Accelerating',
    cls:   'text-rose-400',
    bg:    'bg-rose-900/20 border-rose-800/40',
  },
  decelerating: {
    icon:  '↓',
    label: 'Decelerating',
    cls:   'text-emerald-400',
    bg:    'bg-emerald-900/20 border-emerald-800/40',
  },
  flat: {
    icon:  '→',
    label: 'Flat',
    cls:   'text-amber-400',
    bg:    'bg-amber-900/20 border-amber-800/40',
  },
  insufficient: {
    icon:  '…',
    label: 'Insufficient data',
    cls:   'text-slate-500',
    bg:    'bg-surface-raised border-surface-border',
  },
}

export default function PressureIndicator({ yoySeries = [], label = '', lowerBetter = false }) {
  const pressure = useMemo(() => computePressure(yoySeries), [yoySeries])
  const interpretation = useMemo(
    () => buildInterpretation(label, pressure, yoySeries, { lowerBetter }),
    [label, pressure, yoySeries, lowerBetter],
  )
  const cfg = CONFIG[pressure] ?? CONFIG.insufficient

  return (
    <div className={`rounded-lg border px-3 py-2.5 space-y-1 ${cfg.bg}`}>
      <div className="flex items-center gap-1.5">
        <span className={`font-bold text-sm ${cfg.cls}`}>{cfg.icon}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{interpretation}</p>
    </div>
  )
}
