import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS, METROS } from '@/utils/constants'
import { clearCache } from '@/utils/cache'

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IconTrendingUp({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
function IconMap({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
}
function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
function IconBuilding({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" />
      <rect x="14" y="9" width="7" height="12" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  )
}

const ICON_MAP = { TrendingUp: IconTrendingUp, Map: IconMap }

export default function Sidebar() {
  const { pathname } = useLocation()
  const isMarketsActive = pathname.startsWith('/markets')

  return (
    <aside className="w-56 shrink-0 h-screen flex flex-col bg-surface-card border-r border-surface-border overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <IconBuilding size={14} className="text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-tight">MultiFam</p>
            <p className="text-[10px] text-slate-500 leading-tight">Intel Platform</p>
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="px-2 pt-3 pb-2 space-y-0.5">
        <p className="px-3 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
          Analysis
        </p>
        {NAV_ITEMS.map(item => {
          const Icon = ICON_MAP[item.icon] ?? IconTrendingUp
          const isActive =
            item.path === '/'
              ? pathname === '/'
              : pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Quick-jump to markets */}
      <div className="px-2 pt-2 flex-1 overflow-y-auto min-h-0">
        {isMarketsActive && (
          <>
            <p className="px-3 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              Markets
            </p>
            <div className="space-y-0.5">
              {METROS.map(m => (
                <NavLink
                  key={m.slug}
                  to={`/markets/${m.slug}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-colors duration-100 cursor-pointer
                    ${isActive
                      ? 'text-teal-300 bg-teal-900/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-surface-raised'
                    }`
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                  <span className="truncate">{m.name}</span>
                  <span className="text-slate-600 text-[10px] ml-auto">{m.state}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-surface-border space-y-2">
        <button
          onClick={() => { clearCache(); window.location.reload() }}
          className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors w-full"
          title="Clear cached FRED data and reload"
        >
          <IconTrash size={12} />
          Clear cache & reload
        </button>
        <p className="text-[10px] text-slate-700">
          Data: FRED · BLS · Mock market data<br />
          Cache TTL: 24 hrs
        </p>
      </div>
    </aside>
  )
}
