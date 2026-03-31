// ─────────────────────────────────────────────────────────────────────────────
// Application-wide constants — MultiFam Intel
// ─────────────────────────────────────────────────────────────────────────────

// ── 20 Target Metros ─────────────────────────────────────────────────────────
export const METROS = [
  { slug: 'new-york',          name: 'New York',          state: 'NY', msa: '35620', fredUR: 'NEWY806UR' },
  { slug: 'los-angeles',       name: 'Los Angeles',       state: 'CA', msa: '31080', fredUR: 'LOSA806UR' },
  { slug: 'south-miami',       name: 'South Miami',       state: 'FL', msa: '33100', fredUR: 'MIAM806UR' },
  { slug: 'atlanta',           name: 'Atlanta',           state: 'GA', msa: '12060', fredUR: 'ATLA806UR' },
  { slug: 'san-diego',         name: 'San Diego',         state: 'CA', msa: '41740', fredUR: 'SAND806UR' },
  { slug: 'washington-dc',     name: 'Washington DC',     state: 'DC', msa: '47900', fredUR: 'WASH906UR' },
  { slug: 'las-vegas',         name: 'Las Vegas',         state: 'NV', msa: '29820', fredUR: 'LASV806UR' },
  { slug: 'orlando',           name: 'Orlando',           state: 'FL', msa: '36740', fredUR: 'ORLA806UR' },
  { slug: 'dallas-fort-worth', name: 'Dallas–Fort Worth', state: 'TX', msa: '19100', fredUR: 'DALL806UR' },
  { slug: 'denver',            name: 'Denver',            state: 'CO', msa: '19740', fredUR: 'DENV806UR' },
  { slug: 'phoenix',           name: 'Phoenix',           state: 'AZ', msa: '38060', fredUR: 'PHOE806UR' },
  { slug: 'sf-bay-area',       name: 'SF Bay Area',       state: 'CA', msa: '41860', fredUR: 'SANF806UR' },
  { slug: 'boston',            name: 'Boston',            state: 'MA', msa: '14460', fredUR: 'BOST625UR' },
  { slug: 'tampa',             name: 'Tampa',             state: 'FL', msa: '45300', fredUR: 'TAMP806UR' },
  { slug: 'honolulu',          name: 'Honolulu',          state: 'HI', msa: '26180', fredUR: 'HONO806UR' },
  { slug: 'jacksonville',      name: 'Jacksonville',      state: 'FL', msa: '27260', fredUR: 'JACK806UR' },
  { slug: 'inland-empire',     name: 'Inland Empire',     state: 'CA', msa: '40140', fredUR: 'RIVE806UR' },
  { slug: 'seattle',           name: 'Seattle',           state: 'WA', msa: '42660', fredUR: 'SEAT806UR' },
  { slug: 'raleigh',           name: 'Raleigh',           state: 'NC', msa: '39580', fredUR: 'RALE806UR' },
  { slug: 'philadelphia',      name: 'Philadelphia',      state: 'PA', msa: '37980', fredUR: 'PHIL806UR' },
]

export const METRO_BY_SLUG = Object.fromEntries(METROS.map(m => [m.slug, m]))

// ── FRED Series IDs ───────────────────────────────────────────────────────────
export const FRED_SERIES = {
  // CPI — total & components
  CPI_ALL:          'CPIAUCSL',       // All Urban Consumers
  CPI_CORE:         'CPILFESL',       // Core (ex food & energy)
  CPI_SHELTER:      'CUSR0000SAH1',   // Shelter
  CPI_OER:          'CUSR0000SEHC',   // Owners' Equivalent Rent
  CPI_FOOD:         'CPIUFDSL',       // Food (all)
  CPI_ENERGY:       'CPIENGSL',       // Energy
  CPI_CORE_SVC:     'CUSR0000SASLE',  // Core Services (services ex energy)
  CPI_CORE_GOODS:   'CUSR0000SACL1',  // Core Goods (commodities ex food & energy)
  CPI_TRANSPORT:    'CUUR0000SAT1',   // Transportation
  CPI_MEDICAL:      'CPIMEDSL',       // Medical Care
  CPI_APPAREL:      'CPIAPPSL',       // Apparel

  // Treasury yields & rates
  T10Y:             'DGS10',
  T5Y:              'DGS5',
  T2Y:              'DGS2',
  T10Y2Y_SPREAD:    'T10Y2Y',
  FED_FUNDS:        'FEDFUNDS',
  MORTGAGE_30Y:     'MORTGAGE30US',

  // Volatility
  VIX:              'VIXCLS',

  // Middle-Class Wellbeing
  UNRATE:           'UNRATE',
  SAVINGS_RATE:     'PSAVERT',
  JOLTS_OPENINGS:   'JTSJOL',
  JOLTS_HIRES:      'JTSHIR',
  CC_DELINQ:        'DRCCLACBS',
  AUTO_DELINQ:      'DRAUTOACBS',
  MORTGAGE_DELINQ:  'DRSFRMACBS',
  STUDENT_DELINQ:   'DRSLACBS',
}

// Shelter's approximate weight in the CPI basket
export const SHELTER_WEIGHT = 0.344

// ── CPI Component Definitions ─────────────────────────────────────────────────
export const CPI_COMPONENTS = [
  { id: 'CPI_SHELTER',    seriesId: 'CUSR0000SAH1', label: 'Shelter / OER',    color: '#2dd4bf', weight: 0.344 },
  { id: 'CPI_FOOD',       seriesId: 'CPIUFDSL',     label: 'Food',             color: '#fbbf24', weight: 0.139 },
  { id: 'CPI_ENERGY',     seriesId: 'CPIENGSL',     label: 'Energy',           color: '#f87171', weight: 0.068 },
  { id: 'CPI_CORE_SVC',   seriesId: 'CUSR0000SASLE',label: 'Core Services',    color: '#818cf8', weight: 0.216 },
  { id: 'CPI_CORE_GOODS', seriesId: 'CUSR0000SACL1',label: 'Core Goods',       color: '#34d399', weight: 0.133 },
  { id: 'CPI_TRANSPORT',  seriesId: 'CUUR0000SAT1', label: 'Transportation',   color: '#fb923c', weight: 0.062 },
  { id: 'CPI_MEDICAL',    seriesId: 'CPIMEDSL',     label: 'Medical Care',     color: '#a78bfa', weight: 0.065 },
  { id: 'CPI_APPAREL',    seriesId: 'CPIAPPSL',     label: 'Apparel',          color: '#38bdf8', weight: 0.026 },
]

// ── Wellbeing Indicator Definitions ──────────────────────────────────────────
export const WELLBEING_INDICATORS = [
  {
    id: 'UNRATE',      seriesId: 'UNRATE',      label: 'Unemployment',
    unit: '%',         lowerBetter: true,
    desc: 'National unemployment rate — higher signals labor-market stress.',
    color: '#2dd4bf',
  },
  {
    id: 'CC_DELINQ',   seriesId: 'DRCCLACBS',   label: 'Credit Card Delinquency',
    unit: '%',         lowerBetter: true,
    desc: 'Delinquency rate on credit card loans, all commercial banks (quarterly).',
    color: '#f87171',
  },
  {
    id: 'AUTO_DELINQ', seriesId: 'DRAUTOACBS',  label: 'Auto Delinquency',
    unit: '%',         lowerBetter: true,
    desc: 'Delinquency rate on consumer auto loans, all commercial banks (quarterly).',
    color: '#fb923c',
  },
  {
    id: 'MORT_DELINQ', seriesId: 'DRSFRMACBS',  label: 'Mortgage Delinquency',
    unit: '%',         lowerBetter: true,
    desc: 'Delinquency rate on single-family residential mortgages (quarterly).',
    color: '#fbbf24',
  },
  {
    id: 'STU_DELINQ',  seriesId: 'DRSLACBS',    label: 'Student Loan Delinquency',
    unit: '%',         lowerBetter: true,
    desc: 'Delinquency rate on student loans, all commercial banks (quarterly).',
    color: '#818cf8',
  },
  {
    id: 'PSAVERT',     seriesId: 'PSAVERT',     label: 'Personal Savings Rate',
    unit: '%',         lowerBetter: false,
    desc: 'Personal saving as a % of disposable income — higher signals financial resilience.',
    color: '#34d399',
  },
  {
    id: 'JOLTS',       seriesId: 'JTSJOL',      label: 'Job Openings vs Hires',
    unit: 'K',         lowerBetter: false,  isDual: true,
    seriesId2: 'JTSHIR', label2: 'Hires Rate', color2: '#fbbf24',
    desc: 'JOLTS job openings (thousands) and hires rate — higher signals labor demand.',
    color: '#2dd4bf',
  },
]

// ── NBER Recession Periods (for chart shading) ────────────────────────────────
export const NBER_RECESSIONS = [
  { start: '1990-07-01', end: '1991-03-31', label: '1990–91' },
  { start: '2001-03-01', end: '2001-11-30', label: '2001' },
  { start: '2007-12-01', end: '2009-06-30', label: 'GFC' },
  { start: '2020-02-01', end: '2020-04-30', label: 'COVID-19' },
]

// ── Chart Colors ──────────────────────────────────────────────────────────────
export const COLORS = {
  teal:    '#2dd4bf',
  amber:   '#fbbf24',
  indigo:  '#818cf8',
  rose:    '#f87171',
  emerald: '#34d399',
  orange:  '#fb923c',
  purple:  '#a78bfa',
  sky:     '#38bdf8',
  lime:    '#a3e635',
  pink:    '#f472b6',
}
export const COLOR_ARRAY = Object.values(COLORS)

// Axis / grid styling shared across charts
export const CHART_AXIS_STYLE  = { fill: '#64748b', fontSize: 11 }
export const CHART_GRID_STROKE = '#1e2130'
export const CHART_TOOLTIP_BG  = '#13161f'

// ── Stale-times ───────────────────────────────────────────────────────────────
export const STALE_TIMES = {
  FRED:     1000 * 60 * 60,    // 1 hour
  MARKET:   1000 * 60 * 15,    // 15 min
  REALTIME: 1000 * 60 * 5,     // 5 min
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { path: '/',        label: 'National Dashboard', icon: 'TrendingUp' },
  { path: '/markets', label: 'Metro Heatmap',      icon: 'Map'        },
]
