const CATEGORIES = ['Outdoors', 'Culture', 'Entertainment', 'Food', 'Neighborhood', 'Hidden Gems']
const ATTRIBUTES = ['Dog-friendly', 'Free/cheap', 'Low tourist', 'Not done yet', 'Starred']

export default function FilterBar({ activeFilter, onFilterChange, searchTerm, onSearchChange }) {
  const isActive = (type, value) => activeFilter?.type === type && activeFilter?.value === value
  const isAllActive = !activeFilter

  const handleCategory = value => {
    const cat = value === 'Hidden Gems' ? 'Hidden' : value
    if (isActive('category', cat)) {
      onFilterChange(null)
    } else {
      onFilterChange({ type: 'category', value: cat })
    }
  }

  const handleAttribute = value => {
    if (isActive('attribute', value)) {
      onFilterChange(null)
    } else {
      onFilterChange({ type: 'attribute', value })
    }
  }

  const btnBase = 'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap'
  const activeBtn = 'bg-blue-600 text-white'
  const inactiveBtn = 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => onFilterChange(null)}
          className={`${btnBase} ${isAllActive ? activeBtn : inactiveBtn}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`${btnBase} ${isActive('category', cat === 'Hidden Gems' ? 'Hidden' : cat) ? activeBtn : inactiveBtn}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {ATTRIBUTES.map(attr => (
          <button
            key={attr}
            onClick={() => handleAttribute(attr)}
            className={`${btnBase} ${isActive('attribute', attr) ? 'bg-amber-500 text-white' : inactiveBtn}`}
          >
            {attr === 'Dog-friendly' ? '🐶 Dog-friendly' : attr === 'Starred' ? '★ Starred' : attr}
          </button>
        ))}

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
    </div>
  )
}
