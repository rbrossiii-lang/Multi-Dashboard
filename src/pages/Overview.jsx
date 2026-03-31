import CPISection       from '@/components/overview/CPISection'
import YieldsSection    from '@/components/overview/YieldsSection'
import VIXSection       from '@/components/overview/VIXSection'
import WellbeingSection from '@/components/overview/WellbeingSection'

// Section divider
function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-surface-border" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-1">
        {label}
      </span>
      <div className="h-px flex-1 bg-surface-border" />
    </div>
  )
}

export default function Overview() {
  return (
    <div className="space-y-8 max-w-[1400px]">

      {/* ── Section 1: CPI ──────────────────────────────────────────── */}
      <section>
        <CPISection />
      </section>

      <Divider label="Interest Rates" />

      {/* ── Section 2: Yields ───────────────────────────────────────── */}
      <section>
        <YieldsSection />
      </section>

      <Divider label="Market Volatility" />

      {/* ── Section 3: VIX ──────────────────────────────────────────── */}
      <section>
        <VIXSection />
      </section>

      <Divider label="Middle-Class Wellbeing · $60K–$120K HHI" />

      {/* ── Section 4: Wellbeing ────────────────────────────────────── */}
      <section className="pb-8">
        <WellbeingSection />
      </section>

    </div>
  )
}
