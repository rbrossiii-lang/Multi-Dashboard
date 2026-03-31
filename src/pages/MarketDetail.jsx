import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  fetchMetroUnemployment,
  fetchWellbeingIndicators,
  fetchMetroVacancy,
  fetchMetroConstruction,
  fetchMetroRents,
} from '@/services/dataService'
import { sliceByRange, compute10YrPercentile } from '@/utils/fredHelpers'
import { fmt, getPercentileBgClass } from '@/utils/formatters'
import {
  METRO_BY_SLUG, WELLBEING_INDICATORS,
  CHART_AXIS_STYLE, CHART_GRID_STROKE,
} from '@/utils/constants'
import DownloadableChart   from '@/components/charts/DownloadableChart'
import { ChartSkeleton }   from '@/components/ui/Skeleton'
import ErrorState           from '@/components/ui/ErrorState'
import ChartTooltip         from '@/components/charts/ChartTooltip'
import { getSignalConfig }  from '@/utils/formatters'
import { METRO_MARKET_SNAPSHOT } from '@/utils/mockData'

// ── Wellbeing mini-chart ──────────────────────────────────────────────────────

function WellbeingChart({ indicator, metroSeries, nationalSeries, isFallback, range }) {
  const series = (isFallback || !metroSeries?.length) ? nationalSeries : metroSeries
  const sliced = sliceByRange(series ?? [], range)
  const latest = sliced.at(-1)?.value
  const prior12 = sliced.at(-13)?.value
  const change1Y = latest != null && prior12 != null ? latest - prior12 : null
  const pct = useMemo(() => compute10YrPercentile(series ?? [], indicator.lowerBetter), [series])
  const pctClass = getPercentileBgClass(pct, false)

  const isDeltaGood = indicator.lowerBetter
    ? (change1Y != null && change1Y <= 0)
    : (change1Y != null && change1Y >= 0)

  return (
    <DownloadableChart
      title={indicator.label}
      subtitle={isFallback ? '⚠ National data (metro LAUS series unavailable)' : 'Metro-level — FRED BLS LAUS'}
      filename={`${indicator.id.toLowerCase()}-metro`}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-slate-100">
            {latest != null ? `${latest.toFixed(1)}%` : '—'}
          </span>
          {change1Y != null && (
            <span className={`badge text-[10px] ${isDeltaGood ? 'badge-green' : 'badge-red'}`}>
              {change1Y >= 0 ? '▲' : '▼'}&nbsp;{Math.abs(change1Y).toFixed(1)}pp
            </span>
          )}
          {pct != null && (
            <span className={`badge text-[10px] ${pctClass}`}>{Math.round(pct)}th pct</span>
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={36} tickFormatter={v => `${v.toFixed(1)}%`} />
          <Tooltip content={<ChartTooltip valueFmt={v => `${v?.toFixed(2)}%`} />} />
          <Line type="monotone" dataKey="value" name={indicator.label} stroke={indicator.color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Vacancy chart ─────────────────────────────────────────────────────────────

function VacancyChart({ data, range, onRange }) {
  const sliced = sliceByRange(data ?? [], range)
  const latest = sliced.at(-1)?.value
  return (
    <DownloadableChart
      title="Apartment Vacancy Rate"
      subtitle="Multifamily — mock data (connect CoStar/RealPage API)"
      filename="vacancy"
      range={range}
      onRange={onRange}
      actions={
        <span className="text-base font-bold font-mono text-slate-100">
          {latest != null ? `${latest.toFixed(1)}%` : '—'}
        </span>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis domain={['auto', 'auto']} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={36} tickFormatter={v => `${v.toFixed(1)}%`} />
          <Tooltip content={<ChartTooltip valueFmt={v => `${v?.toFixed(1)}%`} />} />
          <ReferenceLine y={5} stroke="#fbbf24" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: '5% stabilized', position: 'insideTopRight', fill: '#fbbf24', fontSize: 9, opacity: 0.6 }} />
          <Line type="monotone" dataKey="value" name="Vacancy %" stroke="#2dd4bf" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Construction chart (units + % of stock dual-axis) ─────────────────────────

function ConstructionChart({ data, range, onRange }) {
  const sliced = sliceByRange(data ?? [], range)
  const latest = sliced.at(-1)

  return (
    <DownloadableChart
      title="Units Under Construction"
      subtitle="Pipeline + % of existing stock — secondary axis right"
      filename="construction"
      range={range}
      onRange={onRange}
      actions={
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span className="text-slate-500">Units: </span>
            <span className="font-mono font-semibold text-slate-200">
              {latest?.unitsUnderConstruction != null
                ? `${(latest.unitsUnderConstruction / 1000).toFixed(0)}K`
                : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">% Stock: </span>
            <span className="font-mono font-semibold text-amber-300">
              {latest?.pctOfStock != null ? `${latest.pctOfStock.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={sliced} margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="units"
            tick={CHART_AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            tick={CHART_AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={v => `${v.toFixed(1)}%`}
          />
          <Tooltip
            content={
              <ChartTooltip
                valueFmt={(v, name) =>
                  name === '% of Stock' ? `${v?.toFixed(1)}%` : `${(v / 1000).toFixed(0)}K units`
                }
              />
            }
          />
          <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: 10, color: '#64748b', paddingTop: 4 }} />
          <Bar  yAxisId="units" dataKey="unitsUnderConstruction" name="Units Under Const."  fill="#818cf8" fillOpacity={0.6} radius={[2,2,0,0]} isAnimationActive={false} />
          <Line yAxisId="pct"   dataKey="pctOfStock"             name="% of Stock"          stroke="#fbbf24" strokeWidth={2}   dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Completions chart ─────────────────────────────────────────────────────────

function CompletionsChart({ data, range, onRange }) {
  const sliced = sliceByRange(data ?? [], range)
  return (
    <DownloadableChart
      title="Monthly Completions"
      subtitle="Units delivered — mock data (connect CoStar/Census API)"
      filename="completions"
      range={range}
      onRange={onRange}
    >
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={44} tickFormatter={v => `${v.toFixed(0)}`} />
          <Tooltip content={<ChartTooltip valueFmt={v => `${v?.toFixed(0)} units`} />} />
          <Bar dataKey="completions" name="Completions" fill="#34d399" fillOpacity={0.7} radius={[2,2,0,0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Rents chart ───────────────────────────────────────────────────────────────

function RentsChart({ data, range, onRange }) {
  const sliced = sliceByRange(data ?? [], range)
  const latest = sliced.at(-1)
  return (
    <DownloadableChart
      title="Market Rents"
      subtitle="Overall · 1BR · 2BR — Apartment List public data (mock)"
      filename="market-rents"
      range={range}
      onRange={onRange}
      actions={
        <div className="flex items-center gap-3 text-xs">
          {[['Overall', latest?.overall, '#2dd4bf'], ['1BR', latest?.oneBR, '#818cf8'], ['2BR', latest?.twoBR, '#fbbf24']].map(
            ([lbl, val, clr]) => (
              <div key={lbl} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: clr }} />
                <span className="text-slate-500">{lbl}</span>
                <span className="font-mono font-semibold" style={{ color: clr }}>
                  {val != null ? `$${val.toLocaleString()}` : '—'}
                </span>
              </div>
            )
          )}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sliced} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => fmt.dateShort(d)} tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={CHART_AXIS_STYLE} axisLine={false} tickLine={false} width={52} tickFormatter={v => `$${(v/1000).toFixed(1)}K`} />
          <Tooltip content={<ChartTooltip valueFmt={v => `$${v?.toLocaleString()}`} />} />
          <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: 10, color: '#64748b', paddingTop: 4 }} />
          <Line type="monotone" dataKey="overall" name="Overall" stroke="#2dd4bf" strokeWidth={2}   dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="oneBR"   name="1BR"     stroke="#818cf8" strokeWidth={1.5} dot={false} isAnimationActive={false} strokeDasharray="5 3" />
          <Line type="monotone" dataKey="twoBR"   name="2BR"     stroke="#fbbf24" strokeWidth={1.5} dot={false} isAnimationActive={false} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
    </DownloadableChart>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketDetail() {
  const { marketSlug } = useParams()
  const metro = METRO_BY_SLUG[marketSlug]

  const [wbRange, setWbRange]       = useState('5Y')
  const [vacRange, setVacRange]     = useState('5Y')
  const [constRange, setConstRange] = useState('5Y')
  const [rentRange, setRentRange]   = useState('5Y')

  // Metro unemployment (metro-level, falls back to national)
  const { data: metroURData, isLoading: loadingUR } = useQuery({
    queryKey:  ['metro-unemployment', marketSlug],
    queryFn:   () => metro ? fetchMetroUnemployment(metro.fredUR) : null,
    enabled:   !!metro,
    staleTime: 1000 * 60 * 60,
  })

  // National wellbeing (for fallback on non-UR indicators)
  const { data: nationalWB, isLoading: loadingWB } = useQuery({
    queryKey:  ['wellbeing-indicators'],
    queryFn:   () => fetchWellbeingIndicators({ observationStart: '2010-01-01' }),
    staleTime: 1000 * 60 * 60,
  })

  // Market data (vacancy, construction, rents)
  const { data: vacancyData,  isLoading: loadingVac  } = useQuery({
    queryKey:  ['metro-vacancy',      marketSlug],
    queryFn:   () => fetchMetroVacancy(marketSlug),
    enabled:   !!marketSlug,
    staleTime: 1000 * 60 * 15,
  })
  const { data: constructData, isLoading: loadingConst } = useQuery({
    queryKey:  ['metro-construction', marketSlug],
    queryFn:   () => fetchMetroConstruction(marketSlug),
    enabled:   !!marketSlug,
    staleTime: 1000 * 60 * 15,
  })
  const { data: rentsData,  isLoading: loadingRents } = useQuery({
    queryKey:  ['metro-rents',        marketSlug],
    queryFn:   () => fetchMetroRents(marketSlug),
    enabled:   !!marketSlug,
    staleTime: 1000 * 60 * 15,
  })

  const snap    = METRO_MARKET_SNAPSHOT[marketSlug]
  const signal  = snap ? getSignalConfig(
    (() => {
      // Quick composite from snapshot
      const all = Object.values(METRO_MARKET_SNAPSHOT)
      function r(v, arr, lb) {
        const below = arr.filter(x => x < v).length
        const p = Math.round((below / arr.length) * 100)
        return lb ? 100 - p : p
      }
      const vp  = r(snap.vacancy,         all.map(x => x.vacancy),         true)
      const cp  = r(snap.constructionPct, all.map(x => x.constructionPct), true)
      return Math.round(50 * 0.5 + vp * 0.25 + cp * 0.25) // 50 = neutral wb placeholder
    })()
  ) : null

  if (!metro) {
    return (
      <div className="card text-center py-16">
        <p className="text-slate-400 text-sm">Market "{marketSlug}" not found.</p>
        <Link to="/markets" className="text-teal-400 text-xs hover:underline mt-2 block">
          ← Back to heatmap
        </Link>
      </div>
    )
  }

  const isLoadingAny = loadingUR || loadingWB || loadingVac || loadingConst || loadingRents

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Breadcrumb + KPI bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/markets" className="hover:text-teal-400 transition-colors">Metro Heatmap</Link>
            <span>›</span>
            <span className="text-slate-300">{metro.name}, {metro.state}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">{metro.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">MSA {metro.msa} · {metro.state}</p>
        </div>

        {snap && signal && (
          <div className="flex items-center gap-6 shrink-0">
            {[
              { label: 'Vacancy',    value: `${snap.vacancy}%`,         clr: 'text-teal-300' },
              { label: '% Const.',   value: `${snap.constructionPct}%`, clr: 'text-amber-300' },
              { label: 'Rent YoY',  value: `${snap.yoyRentGrowth > 0 ? '+' : ''}${snap.yoyRentGrowth}%`, clr: snap.yoyRentGrowth >= 0 ? 'text-emerald-300' : 'text-rose-300' },
            ].map(kpi => (
              <div key={kpi.label} className="text-right">
                <p className="text-[10px] text-slate-500">{kpi.label}</p>
                <p className={`text-sm font-bold font-mono ${kpi.clr}`}>{kpi.value}</p>
              </div>
            ))}
            <span className={`badge border text-xs ${signal.cls} px-3 py-1`}>
              {signal.label}
            </span>
          </div>
        )}
      </div>

      {/* Wellbeing indicators */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title">Wellbeing Indicators</h2>
            <p className="section-subtitle">
              Unemployment = metro LAUS · all other indicators = national FRED (no metro series available)
            </p>
          </div>
          {/* Range toggle applies to all wellbeing charts */}
          <div className="inline-flex items-center gap-0.5 bg-surface-raised rounded-lg p-0.5">
            {['1Y','3Y','5Y','10Y'].map(r => (
              <button key={r} onClick={() => setWbRange(r)}
                className={`range-btn ${wbRange === r ? 'range-btn-active' : ''}`}
              >{r}</button>
            ))}
          </div>
        </div>

        {loadingWB ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {WELLBEING_INDICATORS.map(i => <ChartSkeleton key={i.id} h="h-36" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {WELLBEING_INDICATORS.map(ind => {
              const isUR = ind.seriesId === 'UNRATE'
              const metroSeries = isUR ? (metroURData?.data ?? []) : null
              const isFallback  = isUR ? (metroURData?.isFallback ?? true) : true
              const natSeries   = nationalWB?.[ind.seriesId] ?? []
              return (
                <WellbeingChart
                  key={ind.id}
                  indicator={ind}
                  metroSeries={metroSeries}
                  nationalSeries={natSeries}
                  isFallback={isFallback}
                  range={wbRange}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* Market fundamentals */}
      <section>
        <h2 className="section-title mb-3">Market Fundamentals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loadingVac
            ? <ChartSkeleton title="Vacancy Rate" h="h-48" />
            : <VacancyChart data={vacancyData} range={vacRange} onRange={setVacRange} />
          }
          {loadingConst
            ? <ChartSkeleton title="Units Under Construction" h="h-48" />
            : <ConstructionChart data={constructData} range={constRange} onRange={setConstRange} />
          }
        </div>
        <div className="mt-4">
          {loadingConst
            ? <ChartSkeleton title="Monthly Completions" h="h-44" />
            : <CompletionsChart data={constructData} range={constRange} onRange={setConstRange} />
          }
        </div>
      </section>

      {/* Rents */}
      <section className="pb-8">
        <h2 className="section-title mb-3">Market Rents</h2>
        {loadingRents
          ? <ChartSkeleton title="Market Rents" h="h-48" />
          : <RentsChart data={rentsData} range={rentRange} onRange={setRentRange} />
        }
        <p className="text-[10px] text-slate-600 mt-2">
          ⚠ Rent data is mock placeholder. Connect the Apartment List rent dataset or CoStar/RealPage API for live data.
        </p>
      </section>

    </div>
  )
}
