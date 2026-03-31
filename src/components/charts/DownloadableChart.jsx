import { useRef } from 'react'
import { downloadChartAsPNG } from '@/utils/fredHelpers'
import RangeToggle from '@/components/ui/RangeToggle'

function IconDownload({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

/**
 * Wrapper that adds a download-PNG button (and optional range toggle) to any
 * Recharts chart rendered as children.
 *
 * Props:
 *   title       — card heading
 *   subtitle    — optional subheading
 *   filename    — PNG filename (without extension)
 *   range       — active range string ('1Y','3Y','5Y','10Y')
 *   onRange     — (r) => void, if provided shows RangeToggle
 *   actions     — optional ReactNode for extra controls (right side)
 *   noPadding   — strip card padding (for full-bleed charts)
 */
export default function DownloadableChart({
  title,
  subtitle,
  filename = 'chart',
  range,
  onRange,
  actions,
  noPadding = false,
  children,
  className = '',
}) {
  const containerRef = useRef(null)

  return (
    <div className={`card ${noPadding ? '!p-0 overflow-hidden' : ''} ${className}`}>
      {/* Header row */}
      <div className={`flex items-start justify-between gap-2 ${noPadding ? 'px-4 pt-4 pb-3' : 'mb-4'}`}>
        <div className="min-w-0">
          {title && (
            <p className="section-title">{title}</p>
          )}
          {subtitle && (
            <p className="section-subtitle">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {onRange && (
            <RangeToggle value={range} onChange={onRange} />
          )}
          <button
            onClick={() => downloadChartAsPNG(containerRef, filename)}
            title="Download as PNG"
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-teal-400
                       bg-surface-raised hover:bg-teal-900/20 rounded-md transition-colors border
                       border-transparent hover:border-teal-800/40"
          >
            <IconDownload size={12} />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Chart area — ref targets this for export */}
      <div ref={containerRef} className={noPadding ? 'px-4 pb-4' : ''}>
        {children}
      </div>
    </div>
  )
}
