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
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userState, setUserState] = useState({})
  const [starredSet, setStarredSet] = useState(new Set())

  // Multi-select filters: categories (AND with attributes), attributes (OR within)
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [selectedAttributes, setSelectedAttributes] = useState(new Set())

  const [searchTerm, setSearchTerm] = useState('')
  const [groupByNeighborhood, setGroupByNeighborhood] = useState(false)
  const [userLocation, setUserLocation] = useState(
    () => localStorage.getItem('nyc-list-location') || 'Williamsburg, Brooklyn'
  )
  const [editingLocation, setEditingLocation] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setShowAuthModal(false)
    })
    return () => subscription.unsubscribe()
  }, [])

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
    if (!user) { setShowAuthModal(true); return }
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
    if (!user) { setShowAuthModal(true); return }
    setUserState(s => ({ ...s, [name]: 'pass' }))
    await upsertState(name, 'pass')
  }

  const handleRestore = async name => {
    if (!user) return
    setUserState(s => { const u = { ...s }; delete u[name]; return u })
    await deleteState(name)
  }

  const handleToggleStar = name => {
    if (!user) { setShowAuthModal(true); return }
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

  const handleToggleCategory = cat => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handleToggleAttribute = attr => {
    setSelectedAttributes(prev => {
      const next = new Set(prev)
      if (next.has(attr)) next.delete(attr)
      else next.add(attr)
      return next
    })
  }

  const handleSignOut = () => supabase.auth.signOut()

  // Filter logic:
  //   - selectedCategories: item must be in at least one selected category (OR within categories)
  //   - selectedAttributes: item must match at least one selected attribute (OR within attributes)
  //   - Both groups combine with AND (must satisfy both)
  const mainActivities = ACTIVITIES.filter(a => {
    if (userState[a.name] === 'pass') return false

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (
        !a.name.toLowerCase().includes(q) &&
        !a.desc.toLowerCase().includes(q) &&
        !a.cat.toLowerCase().includes(q) &&
        !a.neighborhood.toLowerCase().includes(q)
      ) return false
    }

    if (selectedCategories.size > 0 && !selectedCategories.has(a.cat)) return false

    if (selectedAttributes.size > 0) {
      const ok = [...selectedAttributes].some(attr => {
        if (attr === 'Dog-friendly') return a.dog
        if (attr === 'Free/cheap') return isFreeCheap(a.price)
        if (attr === 'Low tourist') return a.tourist === 1
        if (attr === 'Not done yet') return userState[a.name] !== 'done'
        if (attr === 'Starred') return starredSet.has(a.name)
        return false
      })
      if (!ok) return false
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Auth modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <AuthPage onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

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
            {user ? (
              <>
                <span className="text-slate-500 hidden sm:block">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Log in to save progress
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Progress summary — category cards double as category filters */}
        {user && (
          <ProgressSummary
            userState={userState}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
          />
        )}

        {/* Attribute filters + search */}
        <FilterBar
          selectedAttributes={selectedAttributes}
          onToggleAttribute={handleToggleAttribute}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Count row */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">{mainActivities.length}</span> shown
            {user && (
              <>
                {' · '}
                <span className="font-medium text-slate-700">{doneCount}</span> done total
                {passedActivities.length > 0 && (
                  <> · <span className="font-medium text-slate-700">{passedActivities.length}</span> passed</>
                )}
                {starredSet.size > 0 && (
                  <> · <span className="font-medium text-amber-500">★ {starredSet.size}</span> starred</>
                )}
              </>
            )}
          </div>
          <button
            onClick={() => setGroupByNeighborhood(g => !g)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              groupByNeighborhood
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            Group by neighborhood
          </button>
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
          groupByNeighborhood={groupByNeighborhood}
        />

        {/* Passed section */}
        {user && <PassedSection activities={passedActivities} onRestore={handleRestore} />}
      </main>
    </div>
  )
}
