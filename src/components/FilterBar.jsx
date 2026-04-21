const ATTRIBUTES = ['Dog-friendly', 'Free/cheap', 'Low tourist', 'Not done yet', 'Starred']

const ATTR_LABELS = {
  'Dog-friendly': '🐕 Dog-friendly',
  'Free/cheap':   'Free/cheap',
  'Low tourist':  'Low tourist',
  'Not done yet': 'Not done yet',
  'Starred':      '★ Starred',
}

export default function FilterBar({
  selectedAttributes,
  onToggleAttribute,
  searchTerm,
  onSearchChange,
}) {
  const btnBase = 'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap'
  const activeBtn = 'bg-amber-500 text-white'
  const inactiveBtn = 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-700'

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {ATTRIBUTES.map(attr => (
        <button
          key={attr}
          onClick={() => onToggleAttribute(attr)}
          className={`${btnBase} ${selectedAttributes.has(attr) ? activeBtn : inactiveBtn}`}
        >
          {ATTR_LABELS[attr]}
        </button>
      ))}

      {selectedAttributes.size > 0 && (
        <button
          onClick={() => ATTRIBUTES.forEach(a => selectedAttributes.has(a) && onToggleAttribute(a))}
          className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5"
        >
          Clear
        </button>
      )}

      <div className="relative ml-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search…"
          className="pl-8 pr-3 py-1.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-44"
        />
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
