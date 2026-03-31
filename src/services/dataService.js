/**
 * dataService.js
 *
 * FRED API integration with localStorage caching (24-hr TTL).
 * All public functions return Promise<Array<{date, value, ...}>> or
 * Promise<Object<seriesId, Array>> for multi-series fetches.
 */

import axios from 'axios'
import { getCached, setCached } from '@/utils/cache'
import { computeYoY } from '@/utils/fredHelpers'

// ─── Axios instances ─────────────────────────────────────────────────────────

const fred = axios.create({
  baseURL: import.meta.env.VITE_FRED_BASE_URL ?? 'https://api.stlouisfed.org/fred',
  timeout: 15_000,
})

// Attach API key to every FRED request
fred.interceptors.request.use(cfg => {
  cfg.params = {
    api_key:   import.meta.env.VITE_FRED_API_KEY ?? '',
    file_type: 'json',
    ...cfg.params,
  }
  return cfg
})

// ─── Core helpers ─────────────────────────────────────────────────────────────

function parseObs(raw) {
  return raw
    .filter(o => o.value !== '.' && o.value !== '')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
}

async function fetchSeries(seriesId, params = {}) {
  const key = `obs_${seriesId}_${params.observationStart || 'all'}_${params.frequency || 'default'}`
  const hit = getCached(key)
  if (hit) return hit

  const { data } = await fred.get('/series/observations', {
    params: {
      series_id:          seriesId,
      observation_start:  params.observationStart,
      observation_end:    params.observationEnd,
      ...(params.frequency ? { frequency: params.frequency } : {}),
    },
  })

  const result = parseObs(data.observations ?? [])
  setCached(key, result)
  return result
}

async function fetchMultiple(seriesIds, params = {}) {
  const entries = await Promise.all(
    seriesIds.map(id =>
      fetchSeries(id, params)
        .then(data => [id, data])
        .catch(() => [id, []]),       // Graceful fallback: empty array on error
    ),
  )
  return Object.fromEntries(entries)
}

// ─── CPI Components ───────────────────────────────────────────────────────────

/**
 * Fetch CPI total + all sub-components.
 * @returns {Promise<Object>} { CPIAUCSL: [{date, value, yoy}], ... }
 */
export async function fetchCPIComponents(options = {}) {
  const start = options.observationStart ?? '2010-01-01'
  const seriesIds = [
    'CPIAUCSL', 'CPILFESL',
    'CUSR0000SAH1', 'CUSR0000SEHC',
    'CPIUFDSL', 'CPIENGSL',
    'CUSR0000SASLE', 'CUSR0000SACL1',
    'CUUR0000SAT1', 'CPIMEDSL', 'CPIAPPSL',
  ]
  const raw = await fetchMultiple(seriesIds, { observationStart: start })
  // Compute YoY % change for each series
  return Object.fromEntries(
    Object.entries(raw).map(([id, obs]) => [id, computeYoY(obs)])
  )
}

// ─── Yields ───────────────────────────────────────────────────────────────────

/**
 * Fetch Treasury yields: DGS10, DGS5, DGS2, T10Y2Y.
 * @returns {Promise<Object>} { DGS10: [{date, value}], ... }
 */
export async function fetchYields(options = {}) {
  const start = options.observationStart ?? '2010-01-01'
  return fetchMultiple(['DGS10', 'DGS5', 'DGS2', 'T10Y2Y'], {
    observationStart: start,
  })
}

// ─── VIX ─────────────────────────────────────────────────────────────────────

/**
 * Fetch CBOE VIX daily observations.
 * @returns {Promise<Array<{date, value}>>}
 */
export async function fetchVIX(options = {}) {
  const start = options.observationStart ?? '2015-01-01'
  return fetchSeries('VIXCLS', { observationStart: start })
}

// ─── Wellbeing Indicators ─────────────────────────────────────────────────────

/**
 * Fetch all 8 middle-class wellbeing series.
 * @returns {Promise<Object>} Keyed by FRED series ID
 */
export async function fetchWellbeingIndicators(options = {}) {
  const start = options.observationStart ?? '2010-01-01'
  return fetchMultiple(
    ['UNRATE', 'PSAVERT', 'JTSJOL', 'JTSHIR',
     'DRCCLACBS', 'DRAUTOACBS', 'DRSFRMACBS', 'DRSLACBS'],
    { observationStart: start },
  )
}

// ─── Metro Unemployment ───────────────────────────────────────────────────────

/**
 * Fetch metro-level unemployment from BLS LAUS via FRED.
 * Falls back to national UNRATE on series error.
 * @param {string} fredSeriesId  e.g. 'DALL806UR'
 * @param {Object} options
 * @returns {Promise<{data: Array, isFallback: boolean}>}
 */
export async function fetchMetroUnemployment(fredSeriesId, options = {}) {
  const start = options.observationStart ?? '2010-01-01'
  try {
    const data = await fetchSeries(fredSeriesId, { observationStart: start })
    if (data.length === 0) throw new Error('empty')
    return { data, isFallback: false }
  } catch {
    const data = await fetchSeries('UNRATE', { observationStart: start })
    return { data, isFallback: true }
  }
}

// ─── Metro Market Data (vacancy, construction, rents) ─────────────────────────
// Real implementations require CoStar/RealPage/ApartmentList credentials.
// The stubs below are wired to return mock data from mockData.js.
// Swap out the import when real endpoints are available.

import {
  getDFWVacancy,
  getDFWConstruction,
  getDFWRents,
  getMetroVacancySeries,
  getMetroRentSeries,
} from '@/utils/mockData'

export async function fetchMetroVacancy(slug, _options = {}) {
  if (slug === 'dallas-fort-worth') return getDFWVacancy()
  return getMetroVacancySeries(slug)
}

export async function fetchMetroConstruction(slug, _options = {}) {
  if (slug === 'dallas-fort-worth') return getDFWConstruction()
  // Generic placeholder for other metros
  return getDFWConstruction().map(d => ({ ...d, value: d.pctOfStock }))
}

export async function fetchMetroRents(slug, _options = {}) {
  if (slug === 'dallas-fort-worth') return getDFWRents()
  return getMetroRentSeries(slug)
}

// ─── Re-export low-level fetchSeries for ad-hoc use ──────────────────────────
export { fetchSeries }
