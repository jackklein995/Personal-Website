import { useState, useEffect } from 'react'

// Arrow McLaren 2025 drivers
const ARROW_MCLAREN = ['O\'Ward', 'Lundgaard', 'Siegel', 'McLaren']

function isArrowMcLaren(name = '') {
  return ARROW_MCLAREN.some(d => name.toLowerCase().includes(d.toLowerCase()))
}

// ESPN proxied via Vite dev server
const ESPN = '/espn/apis/site/v2/sports/racing/irl'

export default function IndyCarSection() {
  const [standings, setStandings] = useState([])
  const [nextRace, setNextRace]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${ESPN}/standings`).then(r => r.json()),
      fetch(`${ESPN}/scoreboard`).then(r => r.json()),
    ])
      .then(([standData, boardData]) => {
        // Parse standings — ESPN racing standings shape
        const entries =
          standData?.standings?.entries ||
          standData?.children?.[0]?.standings?.entries ||
          []
        setStandings(entries)

        // Find next race — first event whose date is in the future
        const events = boardData?.events || []
        const now = new Date()
        const next = events.find(e => new Date(e.date) >= now) || events[0] || null
        setNextRace(next)

        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return <div className="text-slate-600 text-sm text-center py-12">Loading…</div>
  if (error)   return <div className="text-red-400 text-sm text-center py-12">Failed to load IndyCar data.</div>

  return (
    <div className="space-y-6">
      {/* Next race */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        {!nextRace ? (
          <p className="text-slate-500 text-sm">No upcoming races found.</p>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Next Race</p>
              <p className="text-sm font-semibold text-slate-100">
                {nextRace.name || nextRace.shortName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {nextRace.competitions?.[0]?.venue?.fullName || ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-slate-200">
                {nextRace.date
                  ? new Date(nextRace.date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Arrow McLaren legend */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
        <p className="text-xs text-slate-500">Arrow McLaren drivers highlighted</p>
      </div>

      {/* Standings */}
      {standings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-1">Standings data unavailable right now.</p>
          <p className="text-slate-600 text-xs">
            Live standings at{' '}
            <a
              href="https://www.espn.com/racing/standings/_/series/irl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              ESPN IndyCar
            </a>
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold mb-3">
            Driver Standings
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left w-8">Pos</th>
                  <th className="px-4 py-2.5 text-left">Driver</th>
                  <th className="px-4 py-2.5 text-right hidden sm:table-cell">Wins</th>
                  <th className="px-4 py-2.5 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((entry, i) => {
                  const name = entry.athlete?.displayName || entry.team?.displayName || `Driver ${i + 1}`
                  const stats = entry.stats || []
                  const get = (n) => stats.find(s => s.name === n || s.displayName === n)?.displayValue ?? '—'
                  const rank = get('rank') !== '—' ? get('rank') : i + 1
                  const pts  = get('points')
                  const wins = get('wins')
                  const amcl = isArrowMcLaren(name) ||
                    isArrowMcLaren(entry.team?.displayName || '') ||
                    isArrowMcLaren(entry.athlete?.team?.displayName || '')

                  return (
                    <tr
                      key={entry.athlete?.id || i}
                      className={`border-b border-slate-800/60 transition-colors ${
                        amcl ? 'bg-orange-950/25' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-slate-600 text-xs tabular-nums">{rank}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {amcl && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
                          <span className={`font-medium ${amcl ? 'text-orange-200' : 'text-slate-200'}`}>
                            {name}
                          </span>
                        </div>
                        {entry.team?.displayName && (
                          <p className="text-xs text-slate-600 mt-0.5 ml-3.5">{entry.team.displayName}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500 tabular-nums hidden sm:table-cell">{wins}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-200 tabular-nums">{pts}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
