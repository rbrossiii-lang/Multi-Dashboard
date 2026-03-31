import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { fetchCPIComponents } from '@/services/dataService'
import { sliceByRange } from '@/utils/fredHelpers'
import { fmt } from '@/utils/formatters'
import { CPI_COMPONENTS, SHELTER_WEIGHT, CHART_AXIS_STYLE, CHART_GRID_STROKE } from '@/utils/constants'
import DownloadableChart from '@/components/charts/DownloadableChart'
import PressureIndicator  from '@/components/ui/PressureIndicator'
import { ChartSkeleton }  from '@/components/ui/Skeleton'
import ErrorState          from '@/components/ui/ErrorState'
import ChartTooltip        from '@/components/charts/ChartTooltip'
import clsx from 'clsx'

// ── Shelter Adjustment Widget ─────────────────────────────────────────────────

function ShelterWidget({ actualShelterYoY, shelterTarget, onChange }) {
  return (
    <div className="card-sm space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-300">Shelter Rate Adjustment</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Recalculates Adjusted CPI using shelter weight ≈{(SHELTER_WEIGHT * 100).toFixed(1)}% of basket
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Actual: </span>
          <span className="text-xs font-mono text-teal-400 font-semibold">
            {actualShelterYoY != null ? `${actualShelterYoY.toFixed(1)}%` : '—'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-slate-600 mb-1">
            <span>0%</span><span>Adjusted shelter rate</span><span>10%</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={shelterTarget}
            onChange={e => onChange(parseFloat(e.target.value))}
          />
          <div
            className="mt-1 h-1 rounded-full"
            style={{
              background: `linear-gradient(to right, #2dd4bf ${shelterTarget * 10}%, #1e2130 ${shelterTarget * 10}%)`,
            }}
          />
        </div>
        <input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={shelterTarget.toFixed(1)}
          onChange={e => onChange(Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)))}
        />
        <span className="text-xs text-slate-400">%</span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <span className="w-3 h-0.5 bg-teal-400 inline-block" />
        <span>Actual CPI</span>
        <span className="w-3 h-0.5 bg-amber-400 border-dashed inline-block ml-2" />
        <span>Adjusted CPI (shelter at {shelterTarget.toFixed(1)}%)</span>
      </div>
    </div>
  )
}

// ── Mini component card (sparkline + pressure) ────────────────────────────────

function ComponentCard({ component, yoySeries, range }) {
  const sliced   = sliceByRange(yoySeries, range)
  const latest   = sliced[sliced.length - 1]?.yoy
  const prev12   = sliced.length > 12 ? sliced[sliced.length - 13]?.yoy : null
  const change1Y = latest != null && prev12 != null ? latest - prev12 : null

  return (
    <div className="card-sm space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-200">{component.label}</p>
          <p className="text-[10px] text-slate-500">wt: {(component.weight * 100).toFixed(1)}%</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold font-mono" style={{ color: component.color }}>
            {latest != null ? `${latest.toFixed(1)}%` : '—'}
          </p>
          {change1Y != null && (
            <p className={`text-[10px] ${change1Y >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {change1Y >= 0 ? '▲' : '▼'}{Math.abs(change1Y).toFixed(1)}pp
            </p>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <ResponsiveContainer width="100%" height={55}>
        <LineChart data={sliced} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="yoy"
            stroke={component.color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceLine y={0} stroke="#2a2d3e" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>

      {/* Pressure indicator */}
      <PressureIndicator yoySeries={sliced} label={component.label} />
    </div>
  )
}

// ── Main chart: Total + Core + Shelter YoY + Adjusted ────────────────────────

function CPIMainChart({ allSeries, range, shelterTarget }) {
  const totalSeries   = allSeries['CPIAUCSL'] ?? []
  const coreSeries    = allSeries['CPILFESL']  ?? []
  const shelterSeries = allSeries['CUSR0000SAH1'] ?? []

  const slicedTotal   = sliceByRange(totalSeries,   range)
  const slicedCore    = sliceByRange(coreSeries,    range)
  const slicedShelter = sliceByRange(shelterSeries, range)

  // Merge into one array keyed by date
  const dateMap = {}
  slicedTotal.forEach(d => { dateMap[d.date] = { date: d.date, total: d.yoy } })
  slicedCore.forEach(d  => { if (dateMap[d.date]) dateMap[d.date].core = d.yoy })
  slicedShelter.forEach(d => {
    if (!dateMap[d.date]) return
    dateMap[d.date].shelter = d.yoy
    // Adjusted CPI = total + SHELTER_WEIGHT * (shelterTarget - actual_shelter)
    const actual = d.yoy
    const totalYoY = dateMap[d.date].total
    if (actual != null && totalYoY != null) {
      dateMap[d.date].adjusted = totalYoY + SHELTER_WEIGHT * (shelterTarget - actual)
    }
  })

  const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date))
  const latestShelter = slicedShelter.filter(d => d.yoy != null).at(-1)?.yoy

  return { chartData, latestShelter }
}

// ── Exported section ──────────────────────────────────────────────────────────

export default function CPISection() {
  const [range,  setRange]  = useState('5Y')
  const [shelterTarget, setShelterTarget] = useState(null) // null = not yet initialized

  const { data, isLoading, error, refetch } = useQuery({
    queryKey:  ['cpi-components'],
    queryFn:   () => fetchCPIComponents({ observationStart: '2010-01-01' }),
    staleTime: 1000 * 60 * 60,
  })

  // Initialize shelterTarget to actual once data loads
  const shelterSeries = data?.['CUSR0000SAH1'] ?? []
  const latestShelterYoY = shelterSeries.filter(d => d.yoy != null).at(-1)?.yoy
  const effectiveShelterTarget = shelterTarget ?? (latestShelterYoY ?? 4.0)

  if (isLoading) return (
    <div className="space-y-4">
      <ChartSkeleton title="Consumer Price Index" h="h-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CPI_COMPONENTS.map(c => <ChartSkeleton key={c.id} h="h-28" />)}
      </div>
    </div>
  )

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const totalSeries   = data?.['CPIAUCSL']       ?? []
  const coreSeries    = data?.['CPILFESL']        ?? []
  const shelterSeries2= data?.['CUSR0000SAH1']   ?? []

  // Build main chart data
  const slicedTotal   = sliceByRange(totalSeries,    range)
  const slicedCore    = sliceByRange(coreSeries,     range)
  const slicedShelter = sliceByRange(shelterSeries2, range)

  const dateMap = {}
  slicedTotal.forEach(d => { dateMap[d.date] = { date: d.date, Total: d.yoy } })
  slicedCore.forEach(d  => { if (dateMap[d.date]) dateMap[d.date]['Core (ex F&E)'] = d.yoy })
  slicedShelter.forEach(d => {
    if (!dateMap[d.date]) return
    dateMap[d.date]['Shelter'] = d.yoy
    const totalYoY = dateMap[d.date]['Total']
    if (d.yoy != null && totalYoY != null) {
      dateMap[d.date]['Adjusted CPI'] = parseFloat(
        (totalYoY + SHELTER_WEIGHT * (effectiveShelterTarget - d.yoy)).toFixed(2)
      )
    }
  })
  const mainChartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date))

  const showAdjusted = Math.abs(effectiveShelterTarget - (latestShelterYoY ?? 0)) > 0.05

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Consumer Price Index</h2>
          <p className="section-subtitle">YoY % change — FRED series CPIAUCSL, CPILFESL, CUSR0000SAH1</p>
        </div>
      </div>

      {/* Main multi-line chart */}
      <DownloadableChart
        title="CPI: Total · Core · Shelter · Adjusted"
        subtitle="Year-over-year % change"
        filename="cpi-main"
        range={range}
        onRange={setRange}
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={mainChartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={d => fmt.dateShort(d)}
              tick={CHART_AXIS_STYLE}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `${v.toFixed(1)}%`}
              tick={CHART_AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip
              content={<ChartTooltip valueFmt={v => fmt.pctAbs(v)} />}
            />
            <Legend
              iconType="line"
              iconSize={12}
              wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 8 }}
            />
            <ReferenceLine y={2} stroke="#2a2d3e" strokeDasharray="4 2" label={{ value: '2% target', position: 'insideTopRight', fill: '#3a3d52', fontSize: 10 }} />
            <ReferenceLine y={0} stroke="#2a2d3e" />
            <Line type="monotone" dataKey="Total"          stroke="#f87171" strokeWidth={2}   dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Core (ex F&E)"  stroke="#818cf8" strokeWidth={2}   dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Shelter"        stroke="#2dd4bf" strokeWidth={1.5} dot={false} isAnimationActive={false} strokeDasharray="5 3" />
            {showAdjusted && (
              <Line
                type="monotone"
                dataKey="Adjusted CPI"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Shelter adjustment widget inside the chart card */}
        <ShelterWidget
          actualShelterYoY={latestShelterYoY}
          shelterTarget={effectiveShelterTarget}
          onChange={setShelterTarget}
        />
      </DownloadableChart>

      {/* Sub-component cards grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Sub-components — momentum over last 3 months
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CPI_COMPONENTS.map(comp => {
            const series = data?.[comp.seriesId] ?? []
            return (
              <ComponentCard
                key={comp.id}
                component={comp}
                yoySeries={series}
                range={range}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
