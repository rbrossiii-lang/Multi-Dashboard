import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchWellbeingIndicators } from '@/services/dataService'
import { compute10YrPercentile } from '@/utils/fredHelpers'
import { getPercentileColor, getSignalConfig } from '@/utils/formatters'
import { METROS, WELLBEING_INDICATORS } from '@/utils/constants'
import { METRO_MARKET_SNAPSHOT as MOCK_SNAP } from '@/utils/mockData'
import { SkeletonRow } from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import clsx from 'clsx'

// ── Column definitions ────────────────────────────────────────────────────────

const MARKET_COLS = [
  { id: 'vacancy',      label: 'Vacancy',       unit: '%',  lowerBetter: true  },
  { id: 'constructionPct', label: '% Under Const.', unit: '%', lowerBetter: true },
  { id: 'yoyRentGrowth',  label: 'Rent YoY',     unit: '%',  lowerBetter: false },
]

function SortIcon({ dir }) {
  if (!dir) return <span className="text-slate-700 ml-0.5">⇅</span>
  return <span className="ml-0.5">{dir === 'asc' ? '↑' : '↓'}</span>
}

// ── Percentile cell ───────────────────────────────────────────────────────────

function PctCell({ pct, value, unit = '%', lowerBetter = false }) {
  if (pct == null || value == null)
    return <td className="tbl-cell text-slate-600">—</td>

  const color = getPercentileColor(pct, lowerBetter)
  const bg    = `${color}14`   // ~8% opacity

  return (
    <td className="tbl-cell">
      <div
        className="inline-flex items-center justify-end gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-semibold w-full"
        style={{ color, background: bg }}
      >
        {value.toFixed(1)}{unit}
      </div>
    </td>
  )
}

// ── Score pill ────────────────────────────────────────────────────────────────

function ScorePill({ score }) {
  const cfg = getSignalConfig(score)
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold font-mono text-slate-100">{score}</span>
      <span className={`badge border text-[10px] ${cfg.cls}`}>{cfg.label}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Markets() {
  const navigate = useNavigate()
  const [sortCol, setSortCol] = useState('score')
  const [sortDir, setSortDir] = useState('desc')

  // Fetch national wellbeing data for percentile calculation
  const { data: wellbeingData, isLoading, error, refetch } = useQuery({
    queryKey:  ['wellbeing-indicators'],
    queryFn:   () => fetchWellbeingIndicators({ observationStart: '2010-01-01' }),
    staleTime: 1000 * 60 * 60,
  })

  // Compute national wellbeing percentiles once
  const wellbeingPercentiles = useMemo(() => {
    if (!wellbeingData) return {}
    const result = {}
    WELLBEING_INDICATORS.forEach(ind => {
      const series = wellbeingData[ind.seriesId] ?? []
      result[ind.id] = compute10YrPercentile(series, ind.lowerBetter)
    })
    return result
  }, [wellbeingData])

  // Market data (mock — same for all metros, varies by snapshot)
  const snap = MOCK_SNAP

  // Build all-metro row data
  const rows = useMemo(() => {
    return METROS.map(metro => {
      const mkt = snap[metro.slug] ?? { vacancy: 6, constructionPct: 3, yoyRentGrowth: 1 }

      // Vacancy percentile: collect all metros' vacancy, rank this one
      const allVacancies = Object.values(snap).map(s => s.vacancy)
      const allConst     = Object.values(snap).map(s => s.constructionPct)
      const allRent      = Object.values(snap).map(s => s.yoyRentGrowth)

      function rankPct(val, arr, lowerBetter) {
        const below = arr.filter(v => v < val).length
        const raw   = Math.round((below / arr.length) * 100)
        return lowerBetter ? 100 - raw : raw
      }

      const vacancyPct      = rankPct(mkt.vacancy,         allVacancies, true)
      const constructionPct = rankPct(mkt.constructionPct, allConst,     true)
      const rentPct         = rankPct(mkt.yoyRentGrowth,   allRent,      false)

      // Wellbeing score (same national data for all metros in v1)
      const wbScores = WELLBEING_INDICATORS
        .map(ind => wellbeingPercentiles[ind.id])
        .filter(v => v != null)
      const avgWellbeing = wbScores.length
        ? Math.round(wbScores.reduce((a, b) => a + b, 0) / wbScores.length)
        : 50

      // Composite = wellbeing 50%, vacancy 25%, construction 25%
      const composite = Math.round(
        avgWellbeing * 0.5 +
        vacancyPct * 0.25 +
        constructionPct * 0.25
      )

      return {
        ...metro,
        mkt,
        vacancyPct,
        constructionPct: mkt.constructionPct,
        constructionRankPct: constructionPct,
        rentPct,
        wellbeingPcts: wellbeingPercentiles,
        avgWellbeing,
        score: composite,
      }
    })
  }, [wellbeingPercentiles, snap])

  // Sort
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol]
      // Nested paths
      if (sortCol === 'vacancy')      { va = a.mkt.vacancy;         vb = b.mkt.vacancy }
      if (sortCol === 'constructionPct') { va = a.mkt.constructionPct; vb = b.mkt.constructionPct }
      if (sortCol === 'yoyRentGrowth') { va = a.mkt.yoyRentGrowth;   vb = b.mkt.yoyRentGrowth }
      if (va == null) va = -Infinity
      if (vb == null) vb = -Infinity
      return sortDir === 'asc' ? va - vb : vb - va
    })
  }, [rows, sortCol, sortDir])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  function ThSort({ id, label, className = '' }) {
    const active = sortCol === id
    return (
      <th
        className={`tbl-head ${className}`}
        onClick={() => handleSort(id)}
      >
        <span className={active ? 'text-teal-300' : ''}>
          {label}<SortIcon dir={active ? sortDir : null} />
        </span>
      </th>
    )
  }

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-6 w-64 animate-pulse bg-surface-raised rounded" />
      <div className="card space-y-0">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  )

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-4 max-w-[1500px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title text-base">Metro Market Heatmap</h1>
          <p className="section-subtitle">
            20 markets · cells colored by 10-year percentile rank (green = favorable) ·
            click any row for market detail
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-700/30" />
            <span>Favorable (top tercile)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400/20 border border-amber-700/30" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-400/20 border border-rose-700/30" />
            <span>Unfavorable</span>
          </div>
        </div>
      </div>

      {/* Wellbeing note */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/20 border border-blue-800/30 text-xs text-blue-300">
        <span>ℹ</span>
        <span>
          Wellbeing columns (unemployment through savings) use national FRED data in v1. Metro-level data loads on the individual market page.
        </span>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="tbl-head tbl-head-left pl-4 sticky left-0 bg-surface-card z-10 w-40">
                <span onClick={() => handleSort('name')} className="cursor-pointer hover:text-slate-300">
                  Market<SortIcon dir={sortCol === 'name' ? sortDir : null} />
                </span>
              </th>
              {/* Wellbeing columns */}
              {WELLBEING_INDICATORS.map(ind => (
                <th
                  key={ind.id}
                  className="tbl-head"
                  onClick={() => handleSort(`wb_${ind.id}`)}
                >
                  <span className="text-[10px]">{ind.label.replace(' Delinquency', ' Delinq.').replace('Personal ', '')}</span>
                  <SortIcon dir={sortCol === `wb_${ind.id}` ? sortDir : null} />
                </th>
              ))}
              {/* Market columns */}
              <th className="tbl-head" onClick={() => handleSort('vacancy')}>
                <span>Vacancy<SortIcon dir={sortCol === 'vacancy' ? sortDir : null} /></span>
              </th>
              <th className="tbl-head" onClick={() => handleSort('constructionPct')}>
                <span className="text-[10px]">% Const.<SortIcon dir={sortCol === 'constructionPct' ? sortDir : null} /></span>
              </th>
              <th className="tbl-head" onClick={() => handleSort('yoyRentGrowth')}>
                <span>Rent YoY<SortIcon dir={sortCol === 'yoyRentGrowth' ? sortDir : null} /></span>
              </th>
              {/* Score + signal */}
              <th className="tbl-head" onClick={() => handleSort('score')}>
                <span className={sortCol === 'score' ? 'text-teal-300' : ''}>
                  Score<SortIcon dir={sortCol === 'score' ? sortDir : null} />
                </span>
              </th>
              <th className="tbl-head">Signal</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(row => {
              const signal = getSignalConfig(row.score)
              return (
                <tr
                  key={row.slug}
                  onClick={() => navigate(`/markets/${row.slug}`)}
                  className="cursor-pointer hover:bg-surface-raised/60 transition-colors group"
                >
                  {/* Metro name */}
                  <td className="tbl-cell tbl-cell-left pl-4 sticky left-0 bg-surface-card group-hover:bg-surface-raised/60 z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{row.name}</span>
                      <span className="text-[10px] text-slate-600">{row.state}</span>
                    </div>
                  </td>

                  {/* Wellbeing percentile cells (national data — same for all metros v1) */}
                  {WELLBEING_INDICATORS.map(ind => {
                    const pct = row.wellbeingPcts[ind.id]
                    return (
                      <PctCell
                        key={ind.id}
                        pct={pct}
                        value={pct}
                        unit="th"
                        lowerBetter={false}
                      />
                    )
                  })}

                  {/* Vacancy */}
                  <PctCell pct={row.vacancyPct}          value={row.mkt.vacancy}         unit="%" lowerBetter={true}  />
                  {/* Construction % */}
                  <PctCell pct={row.constructionRankPct} value={row.mkt.constructionPct} unit="%" lowerBetter={true}  />
                  {/* Rent YoY */}
                  <PctCell pct={row.rentPct}             value={row.mkt.yoyRentGrowth}   unit="%" lowerBetter={false} />

                  {/* Composite score */}
                  <td className="tbl-cell text-right">
                    <span className="text-sm font-bold font-mono text-slate-100">{row.score}</span>
                  </td>

                  {/* Signal */}
                  <td className="tbl-cell">
                    <span className={`badge border text-[10px] whitespace-nowrap ${signal.cls}`}>
                      {signal.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Scoring legend */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        {[
          { range: '65–100', label: 'Invest', cls: 'border-emerald-700/40 bg-emerald-900/20 text-emerald-300', desc: 'Strong wellbeing, low vacancy & supply pressure' },
          { range: '40–64',  label: 'Hold',   cls: 'border-amber-700/40  bg-amber-900/20  text-amber-300',  desc: 'Moderate conditions, monitor key indicators' },
          { range: '0–39',   label: 'Consider Selling', cls: 'border-rose-700/40 bg-rose-900/20 text-rose-300', desc: 'Elevated risks: high vacancy, oversupply, or financial stress' },
        ].map(s => (
          <div key={s.range} className={`card-sm border ${s.cls}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{s.label}</span>
              <span className="font-mono text-slate-400">Score {s.range}</span>
            </div>
            <p className="text-slate-400 text-[10px]">{s.desc}</p>
            <p className="text-slate-600 text-[10px] mt-1">
              Composite: wellbeing 50% · vacancy 25% · construction 25%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
