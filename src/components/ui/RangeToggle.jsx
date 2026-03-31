const RANGES = ['1Y', '3Y', '5Y', '10Y']

export default function RangeToggle({ value, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-0.5 bg-surface-raised rounded-lg p-0.5 ${className}`}>
      {RANGES.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`range-btn ${value === r ? 'range-btn-active' : ''}`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
