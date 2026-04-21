import { useState } from 'react'

const CAT_COLORS = {
  Outdoors:      { bg: '#E1F5EE', text: '#0F6E56' },
  Culture:       { bg: '#EEEDFE', text: '#3C3489' },
  Entertainment: { bg: '#FAEEDA', text: '#633806' },
  Food:          { bg: '#FAECE7', text: '#712B13' },
  Explore:       { bg: '#EAF3DE', text: '#27500A' },
  Hidden:        { bg: '#FBEAF0', text: '#72243E' },
}

export default function PassedSection({ activities, onRestore }) {
  const [open, setOpen] = useState(false)

  if (activities.length === 0) return null

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <span>{open ? '▼' : '▶'}</span>
        <span>Passed ({activities.length})</span>
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {activities.map(a => {
                  const colors = CAT_COLORS[a.cat] || {}
                  return (
                    <tr key={a.name} style={{ opacity: 0.3 }} className="hover:opacity-60 transition-opacity">
                      <td className="pl-4 pr-2 py-2.5 w-8">
                        <div className="w-4 h-4 rounded border-2 border-slate-300" />
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900 w-40">
                        <div className="max-w-[160px]">{a.name}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {a.cat === 'Hidden' ? 'Hidden Gems' : a.cat}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-500 max-w-xs">
                        <div className="line-clamp-1">{a.desc}</div>
                      </td>
                      <td className="px-3 py-2.5 ml-auto">
                        <button
                          onClick={() => onRestore(a.name)}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                          style={{ opacity: 1 }}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-slate-100">
            {activities.map(a => {
              const colors = CAT_COLORS[a.cat] || {}
              return (
                <div key={a.name} className="p-4 flex items-center gap-3" style={{ opacity: 0.3 }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{a.name}</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {a.cat === 'Hidden' ? 'Hidden Gems' : a.cat}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRestore(a.name)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium shrink-0"
                    style={{ opacity: 1 }}
                  >
                    Restore
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
