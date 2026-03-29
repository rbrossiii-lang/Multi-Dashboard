/**
 * dataService.js
 *
 * Central data-fetching layer for MultiFam Intel.
 * Primary source: FRED API (api.stlouisfed.org/fred)
 * Secondary sources: BLS, Census, CoStar/RealPage vendor API
 *
 * All functions return Promises and are designed for use with
 * React Query (useQuery / useQueries).
 *
 * Environment variables (see .env.example):
 *   VITE_FRED_API_KEY
 *   VITE_CENSUS_API_KEY
 *   VITE_BLS_API_KEY
 *   VITE_RENT_DATA_API_KEY
 */

import axios from 'axios'

// ─────────────────────────────────────────────────────────────────────────────
// Axios instances — one per upstream API
// ─────────────────────────────────────────────────────────────────────────────

const fredClient = axios.create({
  baseURL: import.meta.env.VITE_FRED_BASE_URL ?? 'https://api.stlouisfed.org/fred',
  params: {
    api_key:     import.meta.env.VITE_FRED_API_KEY,
    file_type:   'json',
  },
})

const blsClient = axios.create({
  baseURL: import.meta.env.VITE_BLS_BASE_URL ?? 'https://api.bls.gov/publicAPI/v2',
  headers: { 'Content-Type': 'application/json' },
})

const censusClient = axios.create({
  baseURL: import.meta.env.VITE_CENSUS_BASE_URL ?? 'https://api.census.gov/data',
})

const rentDataClient = axios.create({
  baseURL: import.meta.env.VITE_RENT_DATA_BASE_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_RENT_DATA_API_KEY}`,
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Macro — CPI Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch CPI component series from FRED.
 * Covers: All Items, Shelter, Primary Rent, OER, Energy, Food.
 *
 * @param {Object}  options
 * @param {string}  options.observationStart  ISO date string (e.g. '2019-01-01')
 * @param {string}  [options.observationEnd]  ISO date string; defaults to today
 * @param {string}  [options.frequency]       FRED frequency code: 'm', 'q', 'a'
 * @returns {Promise<Object>}  Keyed by series ID, each value is an array of
 *                             { date: string, value: number } observations
 */
export async function fetchCPIComponents(options = {}) {
  // TODO: implement
}

// ─────────────────────────────────────────────────────────────────────────────
// Macro — Interest Rates & Treasury Yields
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch Treasury yield series and benchmark rates from FRED.
 * Covers: 2Y, 10Y, 10Y-2Y spread, Fed Funds, SOFR, 30Y mortgage.
 *
 * @param {Object}  options
 * @param {string}  options.observationStart
 * @param {string}  [options.observationEnd]
 * @param {string}  [options.frequency]
 * @returns {Promise<Object>}  Keyed by series ID
 */
export async function fetchYields(options = {}) {
  // TODO: implement
}

// ─────────────────────────────────────────────────────────────────────────────
// Macro — Market Volatility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch CBOE Volatility Index (VIX) daily observations from FRED.
 *
 * @param {Object}  options
 * @param {string}  options.observationStart
 * @param {string}  [options.observationEnd]
 * @returns {Promise<Array<{ date: string, value: number }>>}
 */
export async function fetchVIX(options = {}) {
  // TODO: implement
}

// ─────────────────────────────────────────────────────────────────────────────
// Macro — Consumer Wellbeing Indicators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch consumer health / demand-side indicators from FRED.
 * Covers: national unemployment, JOLTS openings, consumer sentiment (UMich),
 *         real disposable income, PCE, retail sales.
 *
 * @param {Object}  options
 * @param {string}  options.observationStart
 * @param {string}  [options.observationEnd]
 * @param {string}  [options.frequency]
 * @returns {Promise<Object>}  Keyed by series ID
 */
export async function fetchWellbeingIndicators(options = {}) {
  // TODO: implement
}

// ─────────────────────────────────────────────────────────────────────────────
// Metro — Vacancy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch multifamily vacancy rate time-series for a specific metro.
 * Source: CoStar / RealPage vendor API (configured via env).
 *
 * @param {string}  metro   Metro ID from METROS constant (e.g. 'ATL')
 * @param {Object}  options
 * @param {string}  options.observationStart
 * @param {string}  [options.observationEnd]
 * @param {string}  [options.propertyClass]   'A' | 'B' | 'C' | 'all'
 * @returns {Promise<Array<{ date: string, vacancyRate: number }>>}
 */
export async function fetchMetroVacancy(metro, options = {}) {
  // TODO: implement
}

// ─────────────────────────────────────────────────────────────────────────────
// Metro — Construction Pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch multifamily construction pipeline data for a metro.
 * Source: Census Building Permits Survey + CoStar deliveries data.
 *
 * @param {string}  metro   Metro ID
 * @param {Object}  options
 * @param {string}  options.observationStart
 * @param {string}  [options.observationEnd]
 * @returns {Promise<Array<{ date: string, permitsIssued: number, unitsDelivered: number, underConstruction: number }>>}
 */
export async function fetchMetroConstruction(metro, options = {}) {
  // TODO: implement
}

// ─────────────────────────────────────────────────────────────────────────────
// Metro — Rent Trends
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch effective rent and rent growth data for a metro.
 * Source: CoStar / RealPage vendor API.
 *
 * @param {string}  metro   Metro ID
 * @param {Object}  options
 * @param {string}  options.observationStart
 * @param {string}  [options.observationEnd]
 * @param {string}  [options.unitType]   'studio' | '1br' | '2br' | '3br' | 'all'
 * @param {string}  [options.propertyClass]
 * @returns {Promise<Array<{ date: string, effectiveRent: number, askingRent: number, yoyGrowth: number }>>}
 */
export async function fetchMetroRents(metro, options = {}) {
  // TODO: implement
}

// ─────────────────────────────────────────────────────────────────────────────
// Metro — Unemployment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch metro-level unemployment rate from the BLS Local Area Unemployment
 * Statistics (LAUS) program.
 *
 * @param {string}  metro   Metro ID
 * @param {Object}  options
 * @param {number}  options.startYear   Four-digit start year
 * @param {number}  [options.endYear]   Four-digit end year; defaults to current year
 * @returns {Promise<Array<{ date: string, unemploymentRate: number }>>}
 */
export async function fetchMetroUnemployment(metro, options = {}) {
  // TODO: implement
}
