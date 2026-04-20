import { ACTIVITIES } from '../data/activities'

const CATEGORIES = ['Outdoors', 'Culture', 'Entertainment', 'Food', 'Neighborhood', 'Hidden']

const CAT_COLORS = {
  Outdoors:      { bg: '#E1F5EE', text: '#0F6E56', bar: '#0F6E56' },
  Culture:       { bg: '#EEEDFE', text: '#3C3489', bar: '#3C3489' },
  Entertainment: { bg: '#FAEEDA', text: '#633806', bar: '#D97706' },
  Food:          { bg: '#FAECE7', text: '#712B13', bar: '#B45309' },
  Neighborhood:  { bg: '#EAF3DE', text: '#27500A', bar: '#27500A' },
  Hidden:        { bg: '#FBEAF0', text: '#72243E', bar: '#9D174D' },
}

function ProgressCard({ label, done, total, colors }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col gap-1.5 min-w-[110px]">
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: colors.bg, color: colors.text }}
        >
          {label}
        </span>
        <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{done}/{total}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: colors.bar }}
        />
      </div>
      <div className="text-xs text-slate-400">{pct}% done</div>
    </div>
  )
}

export default function ProgressSummary({ userState }) {
  const activitiesByCategory = cat => ACTIVITIES.filter(a => a.cat === cat)

  const doneCount = cat => {
    const acts = cat ? activitiesByCategory(cat) : ACTIVITIES
    return acts.filter(a => userState[a.name] === 'done').length
  }

  const totalCount = cat => cat ? activitiesByCategory(cat).length : ACTIVITIES.length

  const overallDone = doneCount(null)
  const overallTotal = totalCount(null)
  const overallPct = overallTotal === 0 ? 0 : Math.round((overallDone / overallTotal) * 100)

  return (
    <div className="flex flex-wrap gap-3 items-stretch">
      {/* Overall card */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col gap-1.5 min-w-[120px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">All</span>
          <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{overallDone}/{overallTotal}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-blue-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="text-xs text-slate-400">{overallPct}% done</div>
      </div>

      {CATEGORIES.map(cat => (
        <ProgressCard
          key={cat}
          label={cat === 'Hidden' ? 'Hidden Gems' : cat}
          done={doneCount(cat)}
          total={totalCount(cat)}
          colors={CAT_COLORS[cat]}
        />
      ))}
    </div>
  )
}
