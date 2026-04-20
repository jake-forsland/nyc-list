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

function getMapUrl(name, userLocation) {
  const from = encodeURIComponent(userLocation || 'Williamsburg, Brooklyn')
  const to = encodeURIComponent(name + ', New York City')
  return `https://www.google.com/maps/dir/${from}/${to}`
}

function ActivityPhoto({ name, wide = false }) {
  const [error, setError] = useState(false)
  const query = encodeURIComponent(name + ' New York City')
  const size = wide ? '600x300' : '96x96'
  const url = `https://source.unsplash.com/featured/${size}/?${query}`

  if (error) {
    if (wide) return null
    return <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
  }

  return (
    <img
      src={url}
      alt={name}
      onError={() => setError(true)}
      loading="lazy"
      className={wide
        ? 'w-full h-40 object-cover rounded-lg'
        : 'w-10 h-10 rounded-lg object-cover shrink-0'
      }
    />
  )
}

function MapIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  )
}

function SortIcon({ field, sortConfig }) {
  if (sortConfig.field !== field) return <span className="text-slate-300 ml-1">↕</span>
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

export default function ActivityTable({ activities, userState, onToggleDone, onPass, starredSet, onToggleStar, userLocation }) {
  const [sortConfig, setSortConfig] = useState({ field: 'name', dir: 'asc' })
  const [expandedDescs, setExpandedDescs] = useState(new Set())

  const handleSort = field => {
    setSortConfig(prev =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    )
  }

  const toggleExpand = name => {
    setExpandedDescs(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
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

  const locationShort = (userLocation || 'Williamsburg').split(',')[0]

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
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                From {locationShort}
              </th>
              <Th field="dog" sortConfig={sortConfig} onSort={handleSort} className="w-14">Dog?</Th>
              <th className="px-3 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map(a => {
              const isDone = userState[a.name] === 'done'
              const isStarred = starredSet.has(a.name)
              const isExpanded = expandedDescs.has(a.name)
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
                  <td className="px-3 py-3 w-48">
                    <div className="flex items-center gap-2">
                      <ActivityPhoto name={a.name} />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 leading-tight">{a.name}</div>
                        <a
                          href={getMapUrl(a.name, userLocation)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-blue-500 transition-colors mt-0.5"
                          onClick={e => e.stopPropagation()}
                        >
                          <MapIcon /> Maps
                        </a>
                      </div>
                    </div>
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
                    {isExpanded ? (
                      <div>
                        <p>{a.desc}</p>
                        <button
                          onClick={() => toggleExpand(a.name)}
                          className="text-blue-500 hover:text-blue-700 mt-1"
                        >
                          see less
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="line-clamp-2">{a.desc}</div>
                        {a.desc.length > 100 && (
                          <button
                            onClick={() => toggleExpand(a.name)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            see more
                          </button>
                        )}
                      </div>
                    )}
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleStar(a.name)}
                        title={isStarred ? 'Remove star' : 'Star for later'}
                        className={`text-base leading-none transition-colors ${isStarred ? 'text-amber-400 hover:text-amber-300' : 'text-slate-200 hover:text-amber-400'}`}
                      >
                        ★
                      </button>
                      <button
                        onClick={() => onPass(a.name)}
                        title="Pass on this"
                        className="text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                      >
                        Pass
                      </button>
                    </div>
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
          const isStarred = starredSet.has(a.name)
          const isExpanded = expandedDescs.has(a.name)
          const colors = CAT_COLORS[a.cat] || {}
          return (
            <div
              key={a.name}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              style={{ opacity: isDone ? 0.4 : 1 }}
            >
              {isExpanded && <ActivityPhoto name={a.name} wide />}
              <div className="p-4">
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onToggleStar(a.name)}
                          className={`text-lg leading-none transition-colors ${isStarred ? 'text-amber-400' : 'text-slate-200 hover:text-amber-400'}`}
                        >
                          ★
                        </button>
                        <button
                          onClick={() => onPass(a.name)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Pass
                        </button>
                      </div>
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
                    <div className="text-xs text-slate-500 mt-2">
                      {isExpanded ? (
                        <div>
                          <p>{a.desc}</p>
                          <button
                            onClick={() => toggleExpand(a.name)}
                            className="text-blue-500 hover:text-blue-700 mt-1"
                          >
                            see less
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="line-clamp-2">{a.desc}</p>
                          {a.desc.length > 100 && (
                            <button
                              onClick={() => toggleExpand(a.name)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              see more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
                        <span className="shrink-0">{a.price}</span>
                        <span>·</span>
                        <span className="truncate">{a.logistics}</span>
                      </div>
                      <a
                        href={getMapUrl(a.name, userLocation)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs text-slate-400 hover:text-blue-500 transition-colors shrink-0 ml-2"
                      >
                        <MapIcon /> Maps
                      </a>
                    </div>
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
