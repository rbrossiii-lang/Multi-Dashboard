import { format, parseISO } from 'date-fns'

export const fmt = {
  pct: (v, decimals = 1) =>
    v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`,

  pctAbs: (v, decimals = 1) =>
    v == null ? '—' : `${Number(v).toFixed(decimals)}%`,

  num: (v, decimals = 1) =>
    v == null ? '—' : Number(v).toFixed(decimals),

  currency: (v, decimals = 0) =>
    v == null ? '—' : `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: decimals })}`,

  thousands: (v) =>
    v == null ? '—' : `${(v / 1000).toFixed(0)}K`,

  millions: (v) =>
    v == null ? '—' : `${(v / 1000).toFixed(0)}K`,

  date: (isoStr, fmt = 'MMM yyyy') => {
    try { return format(parseISO(isoStr), fmt) }
    catch { return isoStr }
  },

  dateShort: (isoStr) => {
    try { return format(parseISO(isoStr), 'MMM yy') }
    catch { return isoStr }
  },

  dateQ: (isoStr) => {
    try {
      const d = parseISO(isoStr)
      const q = Math.ceil((d.getMonth() + 1) / 3)
      return `Q${q} ${d.getFullYear()}`
    } catch { return isoStr }
  },

  bps: (v) => v == null ? '—' : `${(v * 100).toFixed(0)} bps`,

  delta: (v, unit = 'pp') =>
    v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)} ${unit}`,
}

export function yoyChange(current, priorYear) {
  if (current == null || priorYear == null || priorYear === 0) return null
  return ((current - priorYear) / Math.abs(priorYear)) * 100
}

export function percentileRank(value, dataset) {
  if (!dataset || dataset.length === 0 || value == null) return null
  const below = dataset.filter(v => v < value).length
  return Math.round((below / dataset.length) * 100)
}

export function getPercentileColor(pct, lowerBetter = false) {
  if (pct == null) return '#64748b'
  const adjusted = lowerBetter ? 100 - pct : pct
  if (adjusted >= 65) return '#34d399'   // green
  if (adjusted >= 35) return '#fbbf24'   // amber
  return '#f87171'                        // red
}

export function getPercentileBgClass(pct, lowerBetter = false) {
  if (pct == null) return 'bg-slate-700/40 text-slate-400'
  const adjusted = lowerBetter ? 100 - pct : pct
  if (adjusted >= 65) return 'bg-emerald-900/40 text-emerald-300'
  if (adjusted >= 35) return 'bg-amber-900/40 text-amber-300'
  return 'bg-rose-900/40 text-rose-300'
}

export function getSignalConfig(score) {
  if (score >= 65) return { label: 'Invest', cls: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50', dot: '#34d399' }
  if (score >= 40) return { label: 'Hold',   cls: 'bg-amber-900/50  text-amber-300  border-amber-700/50',  dot: '#fbbf24' }
  return                   { label: 'Consider Selling', cls: 'bg-rose-900/50 text-rose-300 border-rose-700/50', dot: '#f87171' }
}
