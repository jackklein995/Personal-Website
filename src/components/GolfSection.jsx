import { useState, useEffect } from 'react'

// ESPN proxied via Vite dev server
// site.api.espn.com  → /espn
// site.web.api.espn.com → /espn-web
const PGA_BOARD    = '/espn/apis/site/v2/sports/golf/pga/scoreboard'
const OWGR_RANKING = '/espn-web/apis/v2/sports/golf/owgr/rankings?limit=100'

export default function GolfSection() {
  const [rankings, setRankings]   = useState([])
  const [nextEvent, setNextEvent] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(OWGR_RANKING).then(r => r.json()),
      fetch(PGA_BOARD).then(r => r.json()),
    ])
      .then(([rankData, boardData]) => {
        // OWGR from ESPN — nested under rankings[0].ranks
        const ranks =
          rankData?.rankings?.[0]?.ranks ||
          rankData?.ranks ||
          []
        setRankings(ranks)

        // Next PGA Tour event — first event whose start date is today or future
        const events = boardData?.events || []
        const now = new Date()
        const next =
          events.find(e => new Date(e.date) >= now) ||
          events[events.length - 1] ||
          null
        setNextEvent(next)

        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return <div className="text-slate-600 text-sm text-center py-12">Loading…</div>
  if (error)   return <div className="text-red-400 text-sm text-center py-12">Failed to load golf data.</div>

  return (
    <div className="space-y-6">
      {/* Next PGA Tour event */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        {!nextEvent ? (
          <p className="text-slate-500 text-sm">No upcoming PGA Tour event found.</p>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Next PGA Tour Event</p>
              <p className="text-sm font-semibold text-slate-100">
                {nextEvent.name || nextEvent.shortName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {nextEvent.competitions?.[0]?.venue?.fullName || ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-slate-200">
                {nextEvent.date
                  ? new Date(nextEvent.date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })
                  : '—'}
              </p>
              {nextEvent.endDate && (
                <p className="text-xs text-slate-600 mt-0.5">
                  – {new Date(nextEvent.endDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OWGR */}
      {rankings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-1">World rankings unavailable right now.</p>
          <p className="text-slate-600 text-xs">
            Live rankings at{' '}
            <a
              href="https://www.owgr.com/ranking"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              owgr.com
            </a>
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold mb-3">
            Official World Golf Rankings
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left w-8">Rank</th>
                  <th className="px-4 py-2.5 text-left">Player</th>
                  <th className="px-4 py-2.5 text-left hidden sm:table-cell">Country</th>
                  <th className="px-4 py-2.5 text-right hidden sm:table-cell">Avg Pts</th>
                  <th className="px-4 py-2.5 text-right">Move</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, i) => {
                  const movement = r.rankMovement ?? 0
                  const isUp    = movement > 0
                  return (
                    <tr
                      key={r.athlete?.id || i}
                      className={`border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors ${
                        i === 0 ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5 text-slate-600 text-xs tabular-nums">
                        {r.currentRank ?? i + 1}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-200">
                        {r.athlete?.displayName ?? r.displayName ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs hidden sm:table-cell">
                        {r.athlete?.flag?.alt || r.athlete?.country || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums hidden sm:table-cell">
                        {r.average != null ? Number(r.average).toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {movement === 0 ? (
                          <span className="text-slate-700 text-xs">—</span>
                        ) : (
                          <span className={`text-xs font-medium tabular-nums ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                            {isUp ? '▲' : '▼'}{Math.abs(movement)}
                          </span>
                        )}
                      </td>
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
