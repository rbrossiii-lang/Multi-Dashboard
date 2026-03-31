import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchWellbeingIndicators } from '@/services/dataService'
import { sliceByRange, compute10YrPercentile } from '@/utils/fredHelpers'
import { fmt, getPercentileBgClass } from '@/utils/formatters'
import { WELLBEING_INDICATORS, CHART_AXIS_STYLE, CHART_GRID_STROKE } from '@/utils/constants'
import DownloadableChart  from '@/components/charts/DownloadableChart'
import { ChartSkeleton }  from '@/components/ui/Skeleton'
import ErrorState          from '@/components/ui/ErrorState'
import ChartTooltip        from '@/components/charts/ChartTooltip'
import clsx                from 'clsx'

// ── Individual indicator card ─────────────────────────────────────────────────

function WellbeingCard({ indicator, allData }) {
  const [range, setRange] = useState('5Y')

  const rawSeries   = allData?.[indicator.seriesId] ?? []
  const rawSeries2  = indicator.isDual ? (allData?.[indicator.seriesId2] ?? []) : []

  const sliced  = sliceByRange(rawSeries,  range)
  const sliced2 = sliceByRange(rawSeries2, range)

  const latestRaw = rawSeries.at(-1)?.value
  const prior12   = rawSeries.at(-13)?.value
  const change1Y  = latestRaw != null && prior12 != null ? latestRaw - prior12 : null
  const pct10y    = useMemo(() => compute10YrPercentile(rawSeries, indicator.lowerBetter), [rawSeries])
  const pctClass  = getPercentileBgClass(pct10y, false) // already adjusted inside the fn

  const isDeltaGood = indicator.lowerBetter
    ? (change1Y != null && change1Y <= 0)
    : (change1Y != null && change1Y >= 0)

  // Merge dual series if needed
  const chartData = useMemo(() => {
    if (!indicator.isDual) return sliced
    const map = {}
    sliced.forEach(d  => { map[d.date] = { date: d.date, [indicator.label]: d.value } })
    sliced2.forEach(d => { if (map[d.date]) map[d.date][indicator.label2] = d.value })
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }, [sliced, sliced2, indicator])

  const valueFmt = indicator.unit === 'K'
    ? v => `${(v / 1000).toFixed(0)}K`
    : v => `${v?.toFixed(1)}%`

  return (
    <DownloadableChart
      title={indicator.label}
      subtitle={indicator.desc}
      filename={`wellbeing-${indicator.id.toLowerCase()}`}
      range={range}
      onRange={setRange}
      actions={
        <div className="flex items-center gap-2">
          {/* Current value */}
          <span className="text-base font-bold font-mono text-slate-100">
            {latestRaw != null
              ? (indicator.unit === 'K' ? `${(latestRaw / 1000).toFixed(0)}K` : `${latestRaw.toFixed(1)}%`)
              : '—'}
          </span>
          {/* 1Y change */}
          {change1Y != null && (
            <span className={`badge text-[10px] ${isDeltaGood ? 'badge-green' : 'badge-red'}`}>
              {change1Y >= 0 ? '▲' : '▼'}&nbsp;{Math.abs(change1Y).toFixed(1)}pp 1Y
            </span>
          )}
          {/* Percentile */}
          {pct10y != null && (
            <span className={`badge text-[10px] ${pctClass}`}>
              {Math.round(pct10y)}th pct
            </span>
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={160}>
        {indicator.isDual ? (
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
            <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={48} tickFormatter={valueFmt} />
            <Tooltip content={<ChartTooltip valueFmt={valueFmt} />} />
            <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: 10, color: '#64748b', paddingTop: 4 }} />
            <Line type="monotone" dataKey={indicator.label}  stroke={indicator.color}  strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey={indicator.label2} stroke={indicator.color2} strokeWidth={2} dot={false} isAnimationActive={false} strokeDasharray="5 3" />
          </LineChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
            <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={36} tickFormatter={v => `${v.toFixed(1)}%`} />
            <Tooltip content={<ChartTooltip valueFmt={v => `${v?.toFixed(2)}%`} />} />
            <ReferenceLine
              y={rawSeries.filter(d => d.value != null).reduce((a, b, _, arr) => a + b.value / arr.length, 0)}
              stroke="#2a2d3e"
              strokeDasharray="3 3"
              label={{ value: '10Y avg', position: 'insideTopRight', fill: '#475569', fontSize: 9 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={indicator.label}
              stroke={indicator.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Exported section ──────────────────────────────────────────────────────────

export default function WellbeingSection() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey:  ['wellbeing-indicators'],
    queryFn:   () => fetchWellbeingIndicators({ observationStart: '2010-01-01' }),
    staleTime: 1000 * 60 * 60,
  })

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {WELLBEING_INDICATORS.map(i => <ChartSkeleton key={i.id} h="h-44" />)}
      </div>
    </div>
  )

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title">Middle-Class Wellbeing</h2>
        <p className="section-subtitle">
          Proxy indicators for $60K–$120K HHI households · National FRED data · percentile vs 10-year history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {WELLBEING_INDICATORS.map(indicator => (
          <WellbeingCard key={indicator.id} indicator={indicator} allData={data} />
        ))}
      </div>
    </div>
  )
}
