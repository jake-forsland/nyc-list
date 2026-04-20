# NYC List — Claude Reference

## Purpose
Personal NYC activity tracker for Jake (Williamsburg, Brooklyn). Tracks ~101 curated activities with done/pass state, filters, and progress summary. Built to be shared with others.

## Live URL
https://jake-forsland.github.io/nyc-list/

## Stack
- **Frontend:** React 18 + Vite, Tailwind CSS 3
- **Auth + DB:** Supabase (free tier) — `https://chlcsraiatzxsxwkkgav.supabase.co`
- **Hosting:** GitHub Pages (`jake-forsland/nyc-list` repo)
- **CI/CD:** GitHub Actions — auto-deploys on push to `main`
- **Dev:** `npm run dev` → `http://localhost:5173/nyc-list/`

## Key Directories
```
src/
  data/activities.js       ← activity dataset (source-controlled, NOT in DB)
  lib/supabase.js          ← Supabase client init
  components/
    AuthPage.jsx           ← email/password sign in + sign up
    ProgressSummary.jsx    ← overall + per-category progress cards
    FilterBar.jsx          ← category + attribute filters + search
    ActivityTable.jsx      ← main sortable table (desktop) + card view (mobile)
    PassedSection.jsx      ← collapsed passed items with Restore
  App.jsx                  ← root: auth state, Supabase load/save, filter logic
  index.css                ← Tailwind directives
.github/workflows/
  deploy.yml               ← GitHub Actions Pages deploy
.env                       ← gitignored, Supabase keys (never commit)
.env.example               ← committed placeholder
```

## Data Model
### Activity (source-controlled in `src/data/activities.js`)
```js
{
  name: string,       // PRIMARY KEY — must stay stable
  cat: 'Outdoors' | 'Culture' | 'Entertainment' | 'Food' | 'Neighborhood' | 'Hidden',
  desc: string,
  price: string,
  tourist: 1 | 2 | 3,  // 1=low, 2=med, 3=high
  logistics: string,    // transit from Williamsburg
  dog: boolean,
  dogNote: string,
}
```

### User State (Supabase — `activity_states` table)
Keyed on `(user_id, activity_name)`. State values: `'done'` or `'pass'`. RLS enabled — users only see their own rows.

## How to Update the App
Edit files in `src/`, then:
```bash
git add . && git commit -m "your message" && git push
```
GitHub Actions auto-deploys. Takes ~1 min.

## How to Update the Activity List
1. Paste new articles into a Claude chat
2. Ask Claude to extract new items matching the `activities.js` schema
3. Add new items to `src/data/activities.js` (append to the correct category section)
4. **Never rename existing activities** — the name is the DB primary key; renaming loses saved state
5. Commit and push → auto-deploys

## Category Colors
| Category | bg | text |
|---|---|---|
| Outdoors | #E1F5EE | #0F6E56 |
| Culture | #EEEDFE | #3C3489 |
| Entertainment | #FAEEDA | #633806 |
| Food | #FAECE7 | #712B13 |
| Neighborhood | #EAF3DE | #27500A |
| Hidden | #FBEAF0 | #72243E |

## Conventions & Gotchas
- **Tailwind JIT:** No dynamic class names. Use inline styles for dynamic values.
- **`name` field is the DB key** — never rename an activity or that user's saved state is orphaned.
- **Free/cheap filter logic:** `price.startsWith('Free') || /^\$\s?\d/.test(price)`
- **Supabase anon key format:** Uses `sb_publishable_` prefix (newer Supabase format, not the old JWT format — this is correct).
- **GitHub Pages source:** Set to "GitHub Actions" in repo Settings → Pages (not "Deploy from branch").
- **`vite.config.js` base:** Must stay `/nyc-list/` — this is required for GitHub Pages routing.
