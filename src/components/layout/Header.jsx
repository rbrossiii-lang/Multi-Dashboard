import { useLocation } from 'react-router-dom'
import { METROS } from '@/utils/constants'
import { fmt } from '@/utils/formatters'

const ROUTE_LABELS = {
  '/':        { title: 'National Economic Dashboard', subtitle: 'FRED macro indicators — updated daily' },
  '/markets': { title: 'Metro Market Heatmap',        subtitle: '20 metros · composite scoring · invest / hold / sell signals' },
}

export default function Header() {
  const { pathname } = useLocation()

  let title = 'MultiFam Intel'
  let subtitle = ''

  if (ROUTE_LABELS[pathname]) {
    title    = ROUTE_LABELS[pathname].title
    subtitle = ROUTE_LABELS[pathname].subtitle
  } else if (pathname.startsWith('/markets/')) {
    const slug = pathname.split('/markets/')[1]
    const metro = METROS.find(m => m.slug === slug)
    if (metro) {
      title    = `${metro.name}, ${metro.state}`
      subtitle = 'Market detail — vacancy · construction · rents · wellbeing'
    }
  }

  const now = new Date()

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-surface-border bg-surface-card">
      <div>
        <h1 className="text-sm font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>
          {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-500">Live FRED</span>
        </div>
      </div>
    </header>
  )
}
