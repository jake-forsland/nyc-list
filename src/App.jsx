import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { ACTIVITIES } from './data/activities'
import AuthPage from './components/AuthPage'
import ProgressSummary from './components/ProgressSummary'
import FilterBar from './components/FilterBar'
import ActivityTable from './components/ActivityTable'
import PassedSection from './components/PassedSection'

function isFreeCheap(price) {
  return price.startsWith('Free') || /^\$\s?\d/.test(price)
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userState, setUserState] = useState({})
  const [starredSet, setStarredSet] = useState(new Set())
  const [activeFilter, setActiveFilter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [userLocation, setUserLocation] = useState(
    () => localStorage.getItem('nyc-list-location') || 'Williamsburg, Brooklyn'
  )
  const [editingLocation, setEditingLocation] = useState(false)

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load state from Supabase + starred from localStorage when user logs in
  useEffect(() => {
    if (!user) { setUserState({}); setStarredSet(new Set()); return }
    supabase
      .from('activity_states')
      .select('activity_name, state')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(row => { map[row.activity_name] = row.state })
        setUserState(map)
      })
    const stored = localStorage.getItem(`nyc-list-starred-${user.id}`)
    setStarredSet(stored ? new Set(JSON.parse(stored)) : new Set())
  }, [user])

  const upsertState = async (activityName, state) => {
    await supabase.from('activity_states').upsert(
      { user_id: user.id, activity_name: activityName, state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,activity_name' }
    )
  }

  const deleteState = async activityName => {
    await supabase.from('activity_states')
      .delete()
      .eq('user_id', user.id)
      .eq('activity_name', activityName)
  }

  const handleToggleDone = async name => {
    const current = userState[name]
    if (current === 'done') {
      setUserState(s => { const u = { ...s }; delete u[name]; return u })
      await deleteState(name)
    } else {
      setUserState(s => ({ ...s, [name]: 'done' }))
      await upsertState(name, 'done')
    }
  }

  const handlePass = async name => {
    setUserState(s => ({ ...s, [name]: 'pass' }))
    await upsertState(name, 'pass')
  }

  const handleRestore = async name => {
    setUserState(s => { const u = { ...s }; delete u[name]; return u })
    await deleteState(name)
  }

  const handleToggleStar = name => {
    setStarredSet(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      localStorage.setItem(`nyc-list-starred-${user.id}`, JSON.stringify([...next]))
      return next
    })
  }

  const handleSetLocation = location => {
    setUserLocation(location)
    localStorage.setItem('nyc-list-location', location)
  }

  const handleSignOut = () => supabase.auth.signOut()

  // Filter activities
  const mainActivities = ACTIVITIES.filter(a => {
    if (userState[a.name] === 'pass') return false

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (
        !a.name.toLowerCase().includes(q) &&
        !a.desc.toLowerCase().includes(q) &&
        !a.cat.toLowerCase().includes(q)
      ) return false
    }

    if (activeFilter) {
      if (activeFilter.type === 'category') {
        if (a.cat !== activeFilter.value) return false
      } else if (activeFilter.type === 'attribute') {
        if (activeFilter.value === 'Dog-friendly' && !a.dog) return false
        if (activeFilter.value === 'Free/cheap' && !isFreeCheap(a.price)) return false
        if (activeFilter.value === 'Low tourist' && a.tourist !== 1) return false
        if (activeFilter.value === 'Not done yet' && userState[a.name] === 'done') return false
        if (activeFilter.value === 'Starred' && !starredSet.has(a.name)) return false
      }
    }

    return true
  })

  const passedActivities = ACTIVITIES.filter(a => userState[a.name] === 'pass')
  const doneCount = ACTIVITIES.filter(a => userState[a.name] === 'done').length

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading…
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗽</span>
              <h1 className="text-lg font-bold text-slate-900">Stuff to do in NYC</h1>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <span>📍</span>
              {editingLocation ? (
                <form onSubmit={e => { e.preventDefault(); setEditingLocation(false) }} className="inline">
                  <input
                    autoFocus
                    value={userLocation}
                    onChange={e => handleSetLocation(e.target.value)}
                    onBlur={() => setEditingLocation(false)}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs w-48 focus:outline-none focus:border-blue-400"
                  />
                </form>
              ) : (
                <button
                  onClick={() => setEditingLocation(true)}
                  className="hover:text-slate-600 underline decoration-dashed underline-offset-2"
                >
                  {userLocation}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 hidden sm:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Progress summary */}
        <ProgressSummary userState={userState} />

        {/* Filters */}
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Count row */}
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{mainActivities.length}</span> shown
          {' · '}
          <span className="font-medium text-slate-700">{doneCount}</span> done total
          {passedActivities.length > 0 && (
            <> · <span className="font-medium text-slate-700">{passedActivities.length}</span> passed</>
          )}
          {starredSet.size > 0 && (
            <> · <span className="font-medium text-amber-500">★ {starredSet.size}</span> starred</>
          )}
        </div>

        {/* Table */}
        <ActivityTable
          activities={mainActivities}
          userState={userState}
          onToggleDone={handleToggleDone}
          onPass={handlePass}
          starredSet={starredSet}
          onToggleStar={handleToggleStar}
          userLocation={userLocation}
        />

        {/* Passed section */}
        <PassedSection activities={passedActivities} onRestore={handleRestore} />
      </main>
    </div>
  )
}
