import { parseISO, addMonths, format, subYears } from 'date-fns'
import { percentileRank } from './formatters'

/**
 * Compute year-over-year % change for an array of { date, value } observations.
 * Assumes observations are sorted ascending by date and are monthly.
 */
export function computeYoY(observations) {
  return observations.map((obs, i) => {
    if (i < 12) return { ...obs, yoy: null }
    const prev = observations[i - 12]
    if (!prev || prev.value === 0) return { ...obs, yoy: null }
    return { ...obs, yoy: ((obs.value - prev.value) / Math.abs(prev.value)) * 100 }
  })
}

/**
 * Compute month-over-month % change.
 */
export function computeMoM(observations) {
  return observations.map((obs, i) => {
    if (i < 1) return { ...obs, mom: null }
    const prev = observations[i - 1]
    if (!prev || prev.value === 0) return { ...obs, mom: null }
    return { ...obs, mom: ((obs.value - prev.value) / Math.abs(prev.value)) * 100 }
  })
}

/**
 * Derive pressure from the last 3 observations of a yoy series.
 * Returns 'accelerating' | 'decelerating' | 'flat' | 'insufficient'
 */
export function computePressure(yoySeries) {
  const valid = yoySeries.filter(d => d.yoy != null)
  if (valid.length < 3) return 'insufficient'
  const last3 = valid.slice(-3).map(d => d.yoy)
  const slope = last3[2] - last3[0]
  if (slope > 0.15) return 'accelerating'
  if (slope < -0.15) return 'decelerating'
  return 'flat'
}

/**
 * Build a plain-English interpretation for the pressure of a component.
 */
export function buildInterpretation(componentLabel, pressure, yoySeries, opts = {}) {
  const valid = yoySeries.filter(d => d.yoy != null)
  const latest = valid[valid.length - 1]?.yoy
  const prev   = valid[valid.length - 4]?.yoy
  const valStr = latest != null ? `${Math.abs(latest).toFixed(1)}%` : 'N/A'
  const dir    = latest != null && latest >= 0 ? 'up' : 'down'

  const { lowerBetter = false } = opts

  switch (pressure) {
    case 'accelerating':
      return lowerBetter
        ? `${componentLabel} is running ${dir} ${valStr} YoY and worsening over the past three months — adding stress to household budgets.`
        : `${componentLabel} inflation is running at ${valStr} YoY and has accelerated over the past three months, adding upward pressure to overall CPI.`
    case 'decelerating':
      return lowerBetter
        ? `${componentLabel} has eased to ${valStr} YoY over the past three months, providing some relief to consumers.`
        : `${componentLabel} inflation has decelerated to ${valStr} YoY over the past three months, providing relief to overall CPI.`
    case 'flat':
      return `${componentLabel} inflation is holding steady near ${valStr} YoY with minimal momentum over the past three months.`
    default:
      return `Insufficient data to assess ${componentLabel} momentum.`
  }
}

/**
 * Compute the 10-year percentile rank of the latest value in an observations array.
 * @param {Array<{date,value}>} observations  Raw index/rate observations
 * @param {boolean} lowerBetter              If true, low values are "better"
 * @returns {number|null}
 */
export function compute10YrPercentile(observations, lowerBetter = false) {
  if (!observations || observations.length < 2) return null
  const cutoff = format(subYears(new Date(), 10), 'yyyy-MM-dd')
  const tenYear = observations.filter(o => o.date >= cutoff).map(o => o.value)
  if (tenYear.length < 4) return null
  const latest = tenYear[tenYear.length - 1]
  const rawPct = percentileRank(latest, tenYear)
  return lowerBetter ? 100 - rawPct : rawPct
}

/**
 * Slice observations to a date range based on a lookback key ('1Y','3Y','5Y','10Y').
 */
export function sliceByRange(observations, range) {
  if (!observations) return []
  const years = { '1Y': 1, '3Y': 3, '5Y': 5, '10Y': 10 }[range] ?? 5
  const cutoff = format(subYears(new Date(), years), 'yyyy-MM-dd')
  return observations.filter(o => o.date >= cutoff)
}

/**
 * Export a Recharts SVG chart container to PNG and trigger download.
 */
export function downloadChartAsPNG(containerRef, filename = 'chart') {
  if (!containerRef.current) return
  const svg = containerRef.current.querySelector('svg')
  if (!svg) return

  const svgClone = svg.cloneNode(true)
  // Inject dark background rect
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('width', '100%')
  rect.setAttribute('height', '100%')
  rect.setAttribute('fill', '#0f1117')
  svgClone.insertBefore(rect, svgClone.firstChild)

  const svgString = new XMLSerializer().serializeToString(svgClone)
  const svgBlob   = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url        = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.onload = () => {
    const w = svg.clientWidth  || 800
    const h = svg.clientHeight || 400
    const canvas = document.createElement('canvas')
    canvas.width  = w * 2  // Retina
    canvas.height = h * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  img.src = url
}
