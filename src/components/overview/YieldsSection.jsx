import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchYields } from '@/services/dataService'
import { sliceByRange } from '@/utils/fredHelpers'
import { fmt } from '@/utils/formatters'
import { NBER_RECESSIONS, CHART_AXIS_STYLE, CHART_GRID_STROKE } from '@/utils/constants'
import DownloadableChart from '@/components/charts/DownloadableChart'
import { ChartSkeleton }  from '@/components/ui/Skeleton'
import ErrorState          from '@/components/ui/ErrorState'
import ChartTooltip        from '@/components/charts/ChartTooltip'

// ── Yields (3-line) chart ──────────────────────────────────────────────────────

function YieldsChart({ data, range, onRange }) {
  const t10 = sliceByRange(data['DGS10'] ?? [], range)
  const t5  = sliceByRange(data['DGS5']  ?? [], range)
  const t2  = sliceByRange(data['DGS2']  ?? [], range)

  // Merge by date
  const map = {}
  t10.forEach(d => { map[d.date] = { date: d.date, '10yr': d.value } })
  t5.forEach(d  => { if (map[d.date]) map[d.date]['5yr']  = d.value })
  t2.forEach(d  => { if (map[d.date]) map[d.date]['2yr']  = d.value })
  const chartData = Object.values(map).sort((a, b) => a.date.localeCompare(b.date))

  // Latest values
  const latest10 = t10.at(-1)?.value
  const latest5  = t5.at(-1)?.value
  const latest2  = t2.at(-1)?.value

  return (
    <DownloadableChart
      title="Treasury Yields"
      subtitle="Daily constant maturity rates — DGS10 · DGS5 · DGS2"
      filename="treasury-yields"
      range={range}
      onRange={onRange}
      actions={
        <div className="flex items-center gap-3 text-xs">
          {[['10yr', latest10, '#2dd4bf'], ['5yr', latest5, '#818cf8'], ['2yr', latest2, '#fbbf24']].map(
            ([lbl, val, clr]) => (
              <div key={lbl} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: clr }} />
                <span className="text-slate-500">{lbl}</span>
                <span className="font-mono font-semibold text-slate-200">
                  {val != null ? `${val.toFixed(2)}%` : '—'}
                </span>
              </div>
            )
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v.toFixed(1)}%`} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={42} />
          <Tooltip content={<ChartTooltip valueFmt={v => `${v?.toFixed(2)}%`} />} />
          <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 8 }} />
          <Line type="monotone" dataKey="10yr" stroke="#2dd4bf" strokeWidth={2}   dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="5yr"  stroke="#818cf8" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="2yr"  stroke="#fbbf24" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Spread chart with NBER recession shading ──────────────────────────────────

function SpreadChart({ data, range, onRange }) {
  const spread = sliceByRange(data['T10Y2Y'] ?? [], range)
  const latest = spread.at(-1)?.value
  const isInverted = latest != null && latest < 0

  // Filter recessions to range
  const cutoff = spread[0]?.date ?? '1980-01-01'
  const recessions = NBER_RECESSIONS.filter(r => r.end >= cutoff)

  return (
    <DownloadableChart
      title="10yr – 2yr Yield Spread"
      subtitle="Inverted = recession signal · NBER shading"
      filename="yield-spread"
      range={range}
      onRange={onRange}
      actions={
        <div className="flex items-center gap-2">
          <span
            className={`badge text-xs ${isInverted ? 'badge-red' : 'badge-green'}`}
          >
            {isInverted ? '↓ Inverted' : '↑ Normal'}&nbsp;
            {latest != null ? `${latest.toFixed(2)}%` : '—'}
          </span>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={spread} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v.toFixed(1)}%`} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={42} />
          <Tooltip content={<ChartTooltip valueFmt={v => `${v?.toFixed(2)}%`} />} />
          {/* NBER recession shading */}
          {recessions.map(r => (
            <ReferenceArea
              key={r.label}
              x1={r.start}
              x2={r.end}
              fill="#f87171"
              fillOpacity={0.07}
              label={{ value: r.label, position: 'insideTop', fill: '#64748b', fontSize: 9 }}
            />
          ))}
          <ReferenceLine y={0} stroke="#f87171" strokeDasharray="4 2" strokeOpacity={0.6} />
          <Line
            type="monotone"
            dataKey="value"
            name="10Y–2Y"
            stroke={isInverted ? '#f87171' : '#2dd4bf'}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Exported section ──────────────────────────────────────────────────────────

export default function YieldsSection() {
  const [range, setRange] = useState('5Y')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey:  ['yields'],
    queryFn:   () => fetchYields({ observationStart: '2010-01-01' }),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return (
    <div className="space-y-4">
      <ChartSkeleton title="Treasury Yields" h="h-52" />
      <ChartSkeleton title="10yr–2yr Spread" h="h-44" />
    </div>
  )

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-4">
      <h2 className="section-title">Interest Rates &amp; Yield Curve</h2>
      <YieldsChart  data={data} range={range} onRange={setRange} />
      <SpreadChart  data={data} range={range} onRange={setRange} />
    </div>
  )
}
