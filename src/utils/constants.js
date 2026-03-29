// ─────────────────────────────────────────────────────────────────────────────
// Application-wide constants
// ─────────────────────────────────────────────────────────────────────────────

/** The 20 target metros tracked in the portfolio */
export const METROS = [
  { id: 'ATL', name: 'Atlanta, GA',          msa: '12060' },
  { id: 'AUS', name: 'Austin, TX',           msa: '12420' },
  { id: 'BOS', name: 'Boston, MA',           msa: '14460' },
  { id: 'CLT', name: 'Charlotte, NC',        msa: '16740' },
  { id: 'CHI', name: 'Chicago, IL',          msa: '16980' },
  { id: 'DAL', name: 'Dallas-Fort Worth, TX',msa: '19100' },
  { id: 'DEN', name: 'Denver, CO',           msa: '19740' },
  { id: 'HOU', name: 'Houston, TX',          msa: '26420' },
  { id: 'JAX', name: 'Jacksonville, FL',     msa: '27260' },
  { id: 'LAS', name: 'Las Vegas, NV',        msa: '29820' },
  { id: 'LAX', name: 'Los Angeles, CA',      msa: '31080' },
  { id: 'MIA', name: 'Miami, FL',            msa: '33100' },
  { id: 'MSP', name: 'Minneapolis, MN',      msa: '33460' },
  { id: 'NYC', name: 'New York, NY',         msa: '35620' },
  { id: 'ORL', name: 'Orlando, FL',          msa: '36740' },
  { id: 'PHX', name: 'Phoenix, AZ',          msa: '38060' },
  { id: 'RIV', name: 'Riverside, CA',        msa: '40140' },
  { id: 'SAN', name: 'San Antonio, TX',      msa: '41700' },
  { id: 'SEA', name: 'Seattle, WA',          msa: '42660' },
  { id: 'TPA', name: 'Tampa, FL',            msa: '45300' },
]

/** FRED series IDs used across the app */
export const FRED_SERIES = {
  // CPI components
  CPI_ALL:          'CPIAUCSL',
  CPI_SHELTER:      'CUSR0000SAH1',
  CPI_RENT_PRIMARY: 'CUSR0000SEHA',
  CPI_OER:          'CUSR0000SEHC',
  CPI_ENERGY:       'CPIENGSL',
  CPI_FOOD:         'CPIUFDSL',

  // Interest rates & yields
  T10Y:             'GS10',
  T2Y:              'GS2',
  T10Y2Y_SPREAD:    'T10Y2Y',
  FED_FUNDS:        'FEDFUNDS',
  SOFR:             'SOFR',
  MORTGAGE_30Y:     'MORTGAGE30US',

  // Volatility
  VIX:              'VIXCLS',

  // Macro / wellbeing
  UNEMPLOYMENT:     'UNRATE',
  JOLTS_OPENINGS:   'JTSJOL',
  CONSUMER_SENTIMENT: 'UMCSENT',
  REAL_DISP_INCOME: 'DSPIC96',
  PCE:              'PCE',
  RETAIL_SALES:     'RSAFS',
}

/** Recharts color palette for consistent charting */
export const CHART_COLORS = {
  primary:   '#6366f1',
  secondary: '#22d3ee',
  success:   '#34d399',
  warning:   '#fbbf24',
  danger:    '#f87171',
  purple:    '#a78bfa',
  orange:    '#fb923c',
  pink:      '#f472b6',
  teal:      '#2dd4bf',
  lime:      '#a3e635',
}

export const CHART_COLORS_ARRAY = Object.values(CHART_COLORS)

/** React Query stale times */
export const STALE_TIMES = {
  FRED:       1000 * 60 * 60,      // 1 hour — FRED data updates infrequently
  MARKET:     1000 * 60 * 15,      // 15 min
  REALTIME:   1000 * 60 * 5,       // 5 min (VIX, yields)
}

/** Default date range for historical charts */
export const DEFAULT_LOOKBACK_YEARS = 5

/** Nav items — consumed by Sidebar */
export const NAV_ITEMS = [
  { path: '/',              label: 'Overview',         icon: 'LayoutDashboard' },
  { path: '/macro',         label: 'Macro Indicators', icon: 'TrendingUp'      },
  { path: '/metro',         label: 'Metro Analysis',   icon: 'Map'             },
  { path: '/market-intel',  label: 'Market Intel',     icon: 'BarChart2'       },
  { path: '/portfolio',     label: 'Portfolio',        icon: 'Building2'       },
]
