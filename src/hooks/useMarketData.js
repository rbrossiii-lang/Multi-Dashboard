/**
 * useMarketData.js
 *
 * Custom React Query hooks wrapping every dataService function.
 * Components import these hooks instead of calling dataService directly.
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import { subYears, format } from 'date-fns'
import {
  fetchCPIComponents,
  fetchYields,
  fetchVIX,
  fetchWellbeingIndicators,
  fetchMetroVacancy,
  fetchMetroConstruction,
  fetchMetroRents,
  fetchMetroUnemployment,
} from '@/services/dataService'
import { STALE_TIMES, DEFAULT_LOOKBACK_YEARS } from '@/utils/constants'

// ─── helpers ─────────────────────────────────────────────────────────────────

function defaultStartDate(yearsBack = DEFAULT_LOOKBACK_YEARS) {
  return format(subYears(new Date(), yearsBack), 'yyyy-MM-dd')
}

// ─── Macro hooks ─────────────────────────────────────────────────────────────

export function useCPIComponents(options = {}) {
  const opts = { observationStart: defaultStartDate(), ...options }
  return useQuery({
    queryKey:  ['cpi-components', opts],
    queryFn:   () => fetchCPIComponents(opts),
    staleTime: STALE_TIMES.FRED,
  })
}

export function useYields(options = {}) {
  const opts = { observationStart: defaultStartDate(), ...options }
  return useQuery({
    queryKey:  ['yields', opts],
    queryFn:   () => fetchYields(opts),
    staleTime: STALE_TIMES.REALTIME,
  })
}

export function useVIX(options = {}) {
  const opts = { observationStart: defaultStartDate(2), ...options }
  return useQuery({
    queryKey:  ['vix', opts],
    queryFn:   () => fetchVIX(opts),
    staleTime: STALE_TIMES.REALTIME,
  })
}

export function useWellbeingIndicators(options = {}) {
  const opts = { observationStart: defaultStartDate(), ...options }
  return useQuery({
    queryKey:  ['wellbeing', opts],
    queryFn:   () => fetchWellbeingIndicators(opts),
    staleTime: STALE_TIMES.FRED,
  })
}

// ─── Metro hooks ─────────────────────────────────────────────────────────────

export function useMetroVacancy(metro, options = {}) {
  const opts = { observationStart: defaultStartDate(), ...options }
  return useQuery({
    queryKey:  ['metro-vacancy', metro, opts],
    queryFn:   () => fetchMetroVacancy(metro, opts),
    staleTime: STALE_TIMES.MARKET,
    enabled:   !!metro,
  })
}

export function useMetroConstruction(metro, options = {}) {
  const opts = { observationStart: defaultStartDate(), ...options }
  return useQuery({
    queryKey:  ['metro-construction', metro, opts],
    queryFn:   () => fetchMetroConstruction(metro, opts),
    staleTime: STALE_TIMES.MARKET,
    enabled:   !!metro,
  })
}

export function useMetroRents(metro, options = {}) {
  const opts = { observationStart: defaultStartDate(), ...options }
  return useQuery({
    queryKey:  ['metro-rents', metro, opts],
    queryFn:   () => fetchMetroRents(metro, opts),
    staleTime: STALE_TIMES.MARKET,
    enabled:   !!metro,
  })
}

export function useMetroUnemployment(metro, options = {}) {
  const opts = {
    startYear: new Date().getFullYear() - DEFAULT_LOOKBACK_YEARS,
    ...options,
  }
  return useQuery({
    queryKey:  ['metro-unemployment', metro, opts],
    queryFn:   () => fetchMetroUnemployment(metro, opts),
    staleTime: STALE_TIMES.FRED,
    enabled:   !!metro,
  })
}

/**
 * Fetch all four metro data streams in parallel for a given metro.
 * Returns an object: { vacancy, construction, rents, unemployment }
 * Each value mirrors the shape returned by useQuery.
 */
export function useMetroAll(metro, options = {}) {
  const startDate = defaultStartDate()
  const startYear = new Date().getFullYear() - DEFAULT_LOOKBACK_YEARS

  const results = useQueries({
    queries: [
      {
        queryKey:  ['metro-vacancy',      metro, { observationStart: startDate, ...options }],
        queryFn:   () => fetchMetroVacancy(metro, { observationStart: startDate, ...options }),
        staleTime: STALE_TIMES.MARKET,
        enabled:   !!metro,
      },
      {
        queryKey:  ['metro-construction', metro, { observationStart: startDate, ...options }],
        queryFn:   () => fetchMetroConstruction(metro, { observationStart: startDate, ...options }),
        staleTime: STALE_TIMES.MARKET,
        enabled:   !!metro,
      },
      {
        queryKey:  ['metro-rents',        metro, { observationStart: startDate, ...options }],
        queryFn:   () => fetchMetroRents(metro, { observationStart: startDate, ...options }),
        staleTime: STALE_TIMES.MARKET,
        enabled:   !!metro,
      },
      {
        queryKey:  ['metro-unemployment', metro, { startYear, ...options }],
        queryFn:   () => fetchMetroUnemployment(metro, { startYear, ...options }),
        staleTime: STALE_TIMES.FRED,
        enabled:   !!metro,
      },
    ],
  })

  return {
    vacancy:      results[0],
    construction: results[1],
    rents:        results[2],
    unemployment: results[3],
  }
}
