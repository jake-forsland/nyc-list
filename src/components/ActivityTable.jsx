import { useState } from 'react'

const CAT_COLORS = {
  Outdoors:      { bg: '#E1F5EE', text: '#0F6E56' },
  Culture:       { bg: '#EEEDFE', text: '#3C3489' },
  Entertainment: { bg: '#FAEEDA', text: '#633806' },
  Food:          { bg: '#FAECE7', text: '#712B13' },
  Neighborhood:  { bg: '#EAF3DE', text: '#27500A' },
  Hidden:        { bg: '#FBEAF0', text: '#72243E' },
}

const TOURIST_LABELS = { 1: 'Low', 2: 'Med', 3: 'High' }
const TOURIST_COLORS = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-red-100 text-red-700',
}

function SortIcon({ field, sortConfig }) {
  if (sortConfig.field !== field) {
    return <span className="text-slate-300 ml-1">↕</span>
  }
  return <span className="text-blue-600 ml-1">{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>
}

function Th({ children, field, sortConfig, onSort, className = '' }) {
  return (
    <th
      onClick={field ? () => onSort(field) : undefined}
      className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap select-none ${field ? 'cursor-pointer hover:text-slate-700' : ''} ${className}`}
    >
      {children}
      {field && <SortIcon field={field} sortConfig={sortConfig} />}
    </th>
  )
}

export default function ActivityTable({ activities, userState, onToggleDone, onPass }) {
  const [sortConfig, setSortConfig] = useState({ field: 'name', dir: 'asc' })

  const handleSort = field => {
    setSortConfig(prev =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    )
  }

  const sorted = [...activities].sort((a, b) => {
    let av = a[sortConfig.field]
    let bv = b[sortConfig.field]
    if (sortConfig.field === 'dog') { av = a.dog ? 1 : 0; bv = b.dog ? 1 : 0 }
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return sortConfig.dir === 'asc' ? -1 : 1
    if (av > bv) return sortConfig.dir === 'asc' ? 1 : -1
    return 0
  })

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="pl-4 pr-2 py-3 w-8"></th>
              <Th field="name" sortConfig={sortConfig} onSort={handleSort}>Activity</Th>
              <Th field="cat" sortConfig={sortConfig} onSort={handleSort}>Category</Th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Price</th>
              <Th field="tourist" sortConfig={sortConfig} onSort={handleSort} className="w-20">Touristy?</Th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">From Williamsburg</th>
              <Th field="dog" sortConfig={sortConfig} onSort={handleSort} className="w-14">Dog?</Th>
              <th className="px-3 py-3 w-14"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(a => {
              const isDone = userState[a.name] === 'done'
              const colors = CAT_COLORS[a.cat] || {}
              return (
                <tr
                  key={a.name}
                  className="hover:bg-slate-50 transition-colors"
                  style={{ opacity: isDone ? 0.4 : 1 }}
                >
                  <td className="pl-4 pr-2 py-3">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => onToggleDone(a.name)}
                      className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900 w-40">
                    <div className="max-w-[160px]">{a.name}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {a.cat === 'Hidden' ? 'Hidden Gems' : a.cat}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-500 max-w-xs">
                    <div className="line-clamp-2">{a.desc}</div>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-500 whitespace-nowrap max-w-[100px]">
                    <div className="truncate">{a.price}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TOURIST_COLORS[a.tourist]}`}>
                      {TOURIST_LABELS[a.tourist]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-500 max-w-[130px]">
                    <div className="line-clamp-2">{a.logistics}</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {a.dog
                      ? <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">Yes</span>
                      : <span className="text-xs text-slate-300">—</span>
                    }
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => onPass(a.name)}
                      title="Pass on this"
                      className="text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                    >
                      Pass
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-400">No activities match your filters.</div>
        )}
      </div>

      {/* Mobile card view */}
      <div className="md:hidden flex flex-col gap-2">
        {sorted.map(a => {
          const isDone = userState[a.name] === 'done'
          const colors = CAT_COLORS[a.cat] || {}
          return (
            <div
              key={a.name}
              className="bg-white rounded-xl border border-slate-200 p-4"
              style={{ opacity: isDone ? 0.4 : 1 }}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleDone(a.name)}
                  className="mt-1 w-5 h-5 rounded accent-blue-600 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-slate-900 text-sm">{a.name}</div>
                    <button
                      onClick={() => onPass(a.name)}
                      className="text-xs text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      Pass
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {a.cat === 'Hidden' ? 'Hidden Gems' : a.cat}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TOURIST_COLORS[a.tourist]}`}>
                      {TOURIST_LABELS[a.tourist]} tourist
                    </span>
                    {a.dog && (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                        🐶 Dog OK
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{a.desc}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{a.price}</span>
                    <span>·</span>
                    <span>{a.logistics}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-400">No activities match your filters.</div>
        )}
      </div>
    </>
  )
}
