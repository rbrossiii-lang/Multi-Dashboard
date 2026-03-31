/**
 * mockData.js
 *
 * Realistic placeholder data for apartment market metrics (vacancy, construction,
 * rents) that require a CoStar/RealPage/ApartmentList subscription.
 * Replace each entry's data with real API calls when credentials are available.
 *
 * All values are approximate 2024–2025 conditions.
 */

import { subMonths, format } from 'date-fns'

function monthRange(months = 60) {
  const result = []
  for (let i = months; i >= 0; i--) {
    result.push(format(subMonths(new Date('2025-03-01'), i), 'yyyy-MM-dd'))
  }
  return result
}

function buildSeries(dates, startVal, trend, noise = 0.1) {
  let val = startVal
  return dates.map((date, i) => {
    const t = trend(i, dates.length)
    const n = (Math.random() - 0.5) * noise
    val = Math.max(0, val + t + n)
    return { date, value: parseFloat(val.toFixed(2)) }
  })
}

const DATES_5Y   = monthRange(60)
const DATES_10Y  = monthRange(120)

// ─── Per-Metro market data ───────────────────────────────────────────────────

export const METRO_MARKET_SNAPSHOT = {
  'new-york':          { vacancy: 2.8,  constructionPct: 1.2,  yoyRentGrowth:  4.2, unempRate: 4.6 },
  'los-angeles':       { vacancy: 4.1,  constructionPct: 2.1,  yoyRentGrowth:  1.8, unempRate: 5.4 },
  'south-miami':       { vacancy: 4.5,  constructionPct: 4.8,  yoyRentGrowth: -1.2, unempRate: 3.6 },
  'atlanta':           { vacancy: 8.2,  constructionPct: 5.1,  yoyRentGrowth: -2.1, unempRate: 3.8 },
  'san-diego':         { vacancy: 4.8,  constructionPct: 2.4,  yoyRentGrowth:  2.9, unempRate: 4.2 },
  'washington-dc':     { vacancy: 6.1,  constructionPct: 3.2,  yoyRentGrowth:  0.8, unempRate: 3.2 },
  'las-vegas':         { vacancy: 6.8,  constructionPct: 4.2,  yoyRentGrowth: -0.5, unempRate: 5.1 },
  'orlando':           { vacancy: 7.4,  constructionPct: 5.8,  yoyRentGrowth: -1.8, unempRate: 3.4 },
  'dallas-fort-worth': { vacancy: 8.5,  constructionPct: 5.4,  yoyRentGrowth: -1.5, unempRate: 3.9 },
  'denver':            { vacancy: 7.2,  constructionPct: 3.8,  yoyRentGrowth: -0.9, unempRate: 3.6 },
  'phoenix':           { vacancy: 9.1,  constructionPct: 6.2,  yoyRentGrowth: -2.8, unempRate: 3.5 },
  'sf-bay-area':       { vacancy: 6.2,  constructionPct: 2.8,  yoyRentGrowth: -0.4, unempRate: 4.8 },
  'boston':            { vacancy: 4.2,  constructionPct: 3.1,  yoyRentGrowth:  3.8, unempRate: 3.5 },
  'tampa':             { vacancy: 7.8,  constructionPct: 5.9,  yoyRentGrowth: -2.2, unempRate: 3.3 },
  'honolulu':          { vacancy: 3.1,  constructionPct: 1.8,  yoyRentGrowth:  1.2, unempRate: 3.0 },
  'jacksonville':      { vacancy: 8.8,  constructionPct: 4.6,  yoyRentGrowth: -1.9, unempRate: 3.6 },
  'inland-empire':     { vacancy: 4.5,  constructionPct: 3.4,  yoyRentGrowth:  1.5, unempRate: 5.6 },
  'seattle':           { vacancy: 6.9,  constructionPct: 3.9,  yoyRentGrowth:  0.2, unempRate: 4.2 },
  'raleigh':           { vacancy: 8.1,  constructionPct: 6.8,  yoyRentGrowth: -3.1, unempRate: 3.4 },
  'philadelphia':      { vacancy: 4.9,  constructionPct: 2.2,  yoyRentGrowth:  3.2, unempRate: 4.3 },
}

// ─── DFW Time-Series (5-Year History) ────────────────────────────────────────

export function getDFWVacancy() {
  return DATES_5Y.map((date, i) => ({
    date,
    value: parseFloat((5.2 + i * 0.055 + Math.sin(i / 8) * 0.3 + (Math.random() - 0.5) * 0.15).toFixed(2)),
  }))
}

export function getDFWConstruction() {
  return DATES_5Y.map((date, i) => {
    const units = Math.round(
      12000 + i * 180 - Math.max(0, (i - 30) * 120) + (Math.random() - 0.5) * 800,
    )
    const pctOfStock = parseFloat(((units / 680000) * 100).toFixed(2))
    const completions = i > 0
      ? Math.max(0, Math.round(units * 0.08 + (Math.random() - 0.5) * 300))
      : 0
    return { date, unitsUnderConstruction: units, pctOfStock, completions }
  })
}

export function getDFWRents() {
  return DATES_5Y.map((date, i) => {
    const overall = 1350 + i * 3.1 - Math.max(0, (i - 36) * 1.8) + (Math.random() - 0.5) * 20
    return {
      date,
      overall:  Math.round(overall),
      oneBR:    Math.round(overall * 0.88),
      twoBR:    Math.round(overall * 1.22),
    }
  })
}

export function getMetroVacancySeries(slug) {
  const snap = METRO_MARKET_SNAPSHOT[slug]
  if (!snap) return []
  const target = snap.vacancy
  return DATES_5Y.map((date, i) => ({
    date,
    value: parseFloat(
      (target - (60 - i) * 0.04 + Math.sin(i / 9) * 0.25 + (Math.random() - 0.5) * 0.2).toFixed(2),
    ),
  }))
}

export function getMetroRentSeries(slug) {
  const snaps = {
    'new-york': 3200, 'los-angeles': 2600, 'south-miami': 2100, 'atlanta': 1450,
    'san-diego': 2450, 'washington-dc': 2200, 'las-vegas': 1500, 'orlando': 1550,
    'dallas-fort-worth': 1430, 'denver': 1700, 'phoenix': 1500, 'sf-bay-area': 2900,
    'boston': 2800, 'tampa': 1650, 'honolulu': 2500, 'jacksonville': 1400,
    'inland-empire': 1850, 'seattle': 2100, 'raleigh': 1550, 'philadelphia': 1850,
  }
  const base = snaps[slug] ?? 1500
  return DATES_5Y.map((date, i) => {
    const overall = base + i * 2.5 - Math.max(0, (i - 36) * 1.5) + (Math.random() - 0.5) * 25
    return {
      date,
      overall:  Math.round(overall),
      oneBR:    Math.round(overall * 0.87),
      twoBR:    Math.round(overall * 1.20),
    }
  })
}
