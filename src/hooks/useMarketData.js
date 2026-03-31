/**
 * useMarketData.js
 *
 * React Query hooks wrapping every dataService function.
 * Components should import these hooks rather than calling dataService directly.
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import { subYears, format }     from 'date-fns'
import {
  fetchCPIComponents,
  fetchYields,
  fetchVIX,
  fetchWellbeingIndicators,
  fetchMetroUnemployment,
  fetchMetroVacancy,
  fetchMetroConstruction,
  fetchMetroRents,
} from '@/services/dataService'
import { METRO_BY_SLUG, STALE_TIMES } from '@/utils/constants'

// ─── helpers ──────────────────────────────────────────────────────────────────

function startDate(yearsBack = 5) {
  return format(subYears(new Date(), yearsBack), 'yyyy-MM-dd')
}

// ─── Macro ────────────────────────────────────────────────────────────────────

export function useCPIComponents(yearsBack = 12) {
  return useQuery({
    queryKey:  ['cpi-components', yearsBack],
    queryFn:   () => fetchCPIComponents({ observationStart: startDate(yearsBack) }),
    staleTime: STALE_TIMES.FRED,
  })
}

export function useYields(yearsBack = 10) {
  return useQuery({
    queryKey:  ['yields', yearsBack],
    queryFn:   () => fetchYields({ observationStart: startDate(yearsBack) }),
    staleTime: STALE_TIMES.REALTIME,
  })
}

export function useVIX(yearsBack = 5) {
  return useQuery({
    queryKey:  ['vix', yearsBack],
    queryFn:   () => fetchVIX({ observationStart: startDate(yearsBack) }),
    staleTime: STALE_TIMES.REALTIME,
  })
}

export function useWellbeingIndicators(yearsBack = 12) {
  return useQuery({
    queryKey:  ['wellbeing-indicators', yearsBack],
    queryFn:   () => fetchWellbeingIndicators({ observationStart: startDate(yearsBack) }),
    staleTime: STALE_TIMES.FRED,
  })
}

// ─── Metro ────────────────────────────────────────────────────────────────────

export function useMetroUnemployment(slug) {
  const metro = METRO_BY_SLUG[slug]
  return useQuery({
    queryKey:  ['metro-unemployment', slug],
    queryFn:   () => fetchMetroUnemployment(metro?.fredUR ?? 'UNRATE'),
    enabled:   !!slug && !!metro,
    staleTime: STALE_TIMES.FRED,
  })
}

export function useMetroVacancy(slug) {
  return useQuery({
    queryKey:  ['metro-vacancy', slug],
    queryFn:   () => fetchMetroVacancy(slug),
    enabled:   !!slug,
    staleTime: STALE_TIMES.MARKET,
  })
}

export function useMetroConstruction(slug) {
  return useQuery({
    queryKey:  ['metro-construction', slug],
    queryFn:   () => fetchMetroConstruction(slug),
    enabled:   !!slug,
    staleTime: STALE_TIMES.MARKET,
  })
}

export function useMetroRents(slug) {
  return useQuery({
    queryKey:  ['metro-rents', slug],
    queryFn:   () => fetchMetroRents(slug),
    enabled:   !!slug,
    staleTime: STALE_TIMES.MARKET,
  })
}

/**
 * Fetch all four metro data streams in parallel.
 * @returns {{ unemployment, vacancy, construction, rents }}
 */
export function useMetroAll(slug) {
  const metro = METRO_BY_SLUG[slug]
  const enabled = !!slug && !!metro

  const results = useQueries({
    queries: [
      {
        queryKey: ['metro-unemployment', slug],
        queryFn:  () => fetchMetroUnemployment(metro?.fredUR ?? 'UNRATE'),
        enabled,
        staleTime: STALE_TIMES.FRED,
      },
      {
        queryKey: ['metro-vacancy', slug],
        queryFn:  () => fetchMetroVacancy(slug),
        enabled,
        staleTime: STALE_TIMES.MARKET,
      },
      {
        queryKey: ['metro-construction', slug],
        queryFn:  () => fetchMetroConstruction(slug),
        enabled,
        staleTime: STALE_TIMES.MARKET,
      },
      {
        queryKey: ['metro-rents', slug],
        queryFn:  () => fetchMetroRents(slug),
        enabled,
        staleTime: STALE_TIMES.MARKET,
      },
    ],
  })

  return {
    unemployment: results[0],
    vacancy:      results[1],
    construction: results[2],
    rents:        results[3],
    isLoading:    results.some(r => r.isLoading),
    isError:      results.some(r => r.isError),
  }
}
