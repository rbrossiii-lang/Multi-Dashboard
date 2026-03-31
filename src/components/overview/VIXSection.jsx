import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchVIX } from '@/services/dataService'
import { sliceByRange } from '@/utils/fredHelpers'
import { fmt } from '@/utils/formatters'
import { CHART_AXIS_STYLE, CHART_GRID_STROKE } from '@/utils/constants'
import DownloadableChart from '@/components/charts/DownloadableChart'
import { ChartSkeleton }  from '@/components/ui/Skeleton'
import ErrorState          from '@/components/ui/ErrorState'
import ChartTooltip        from '@/components/charts/ChartTooltip'

function getVIXRegime(value) {
  if (value == null) return { label: '—', cls: 'badge-slate',  dot: '#64748b' }
  if (value < 15)   return { label: 'Low Volatility',  cls: 'badge-green',  dot: '#34d399' }
  if (value < 25)   return { label: 'Elevated',        cls: 'badge-yellow', dot: '#fbbf24' }
  return              { label: 'High Stress',    cls: 'badge-red',    dot: '#f87171' }
}

export default function VIXSection() {
  const [range, setRange] = useState('3Y')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey:  ['vix'],
    queryFn:   () => fetchVIX({ observationStart: '2010-01-01' }),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return <ChartSkeleton title="Market Volatility (VIX)" h="h-48" />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const sliced = sliceByRange(data ?? [], range)
  const latest = sliced.at(-1)?.value
  const regime = getVIXRegime(latest)
  const maxVIX = Math.ceil(Math.max(...sliced.map(d => d.value), 30) / 5) * 5

  return (
    <div className="space-y-3">
      <h2 className="section-title">Market Volatility — VIX</h2>
      <DownloadableChart
        title="CBOE Volatility Index (VIX)"
        subtitle="Daily — green &lt;15 · yellow 15–25 · red &gt;25"
        filename="vix"
        range={range}
        onRange={setRange}
        actions={
          <div className="flex items-center gap-2">
            <span className={`badge text-xs ${regime.cls}`}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: regime.dot }} />
              {regime.label}
            </span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {latest?.toFixed(1) ?? '—'}
            </span>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="vixGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f87171" stopOpacity={0.25} />
                <stop offset="60%"  stopColor="#fbbf24" stopOpacity={0.10} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
            <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis domain={[0, maxVIX]} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<ChartTooltip valueFmt={v => v?.toFixed(1)} />} />

            {/* Color bands */}
            <ReferenceArea y1={0}  y2={15}      fill="#34d399" fillOpacity={0.04} />
            <ReferenceArea y1={15} y2={25}      fill="#fbbf24" fillOpacity={0.04} />
            <ReferenceArea y1={25} y2={maxVIX}  fill="#f87171" fillOpacity={0.05} />

            {/* Band boundary lines */}
            <ReferenceLine y={15} stroke="#34d399" strokeOpacity={0.3} strokeDasharray="3 3" label={{ value: '15', position: 'insideRight', fill: '#34d399', fontSize: 9, opacity: 0.5 }} />
            <ReferenceLine y={25} stroke="#f87171" strokeOpacity={0.3} strokeDasharray="3 3" label={{ value: '25', position: 'insideRight', fill: '#f87171', fontSize: 9, opacity: 0.5 }} />

            <Area
              type="monotone"
              dataKey="value"
              name="VIX"
              stroke="#f87171"
              strokeWidth={1.5}
              fill="url(#vixGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend bands */}
        <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-emerald-400/20 border border-emerald-700/30" />
            <span>&lt;15 — Low volatility</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-amber-400/20 border border-amber-700/30" />
            <span>15–25 — Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-rose-400/20 border border-rose-700/30" />
            <span>&gt;25 — High stress</span>
          </div>
        </div>
      </DownloadableChart>
    </div>
  )
}
