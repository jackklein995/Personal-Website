import { useState, useEffect } from 'react'

const ARROW_MCLAREN = ["O'Ward", 'Lundgaard', 'Siegel', 'McLaughlin']

function isArrowMcLaren(name = '') {
  return ARROW_MCLAREN.some(d => name.toLowerCase().includes(d.toLowerCase()))
}

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
        console.log('IndyCar standings raw:', JSON.stringify(standData, null, 2))
        const entries =
          standData?.standings?.entries ||
          standData?.children?.[0]?.standings?.entries ||
          []
        setStandings(entries)

        const events = boardData?.events || []
        const next = events.find(e => new Date(e.date) >= new Date()) || events[0] || null
        setNextRace(next)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return <div className="text-slate-600 text-sm text-center py-12">Loading…</div>
  if (error)   return <div className="text-red-500/70 text-sm text-center py-12">Failed to load IndyCar data.</div>

  return (
    <div className="space-y-6">
      {/* Next race */}
      {nextRace && (
        <div className="bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Next Race</p>
            <p className="text-sm font-semibold text-slate-300">
              {nextRace.name || nextRace.shortName}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {nextRace.competitions?.[0]?.venue?.fullName || ''}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-slate-400">
              {nextRace.date
                ? new Date(nextRace.date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-400/80 flex-shrink-0" />
        <p className="text-xs text-slate-600">Arrow McLaren drivers</p>
      </div>

      {/* Standings */}
      {standings.length === 0 ? (
        <div className="bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl p-6 text-center">
          <p className="text-slate-500 text-sm mb-1">Standings unavailable right now.</p>
          <p className="text-slate-700 text-xs">Season may not have started yet.</p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-3">
            Driver Standings — {new Date().getFullYear()}
          </p>
          <div className="bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-600 text-xs uppercase tracking-wider bg-[#080f1e]/40">
                  <th className="px-4 py-2.5 text-left w-8">Pos</th>
                  <th className="px-4 py-2.5 text-left">Driver</th>
                  <th className="px-4 py-2.5 text-right hidden sm:table-cell">Team</th>
                  <th className="px-4 py-2.5 text-right hidden sm:table-cell">Wins</th>
                  <th className="px-4 py-2.5 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((entry, i) => {
                  const name = entry.athlete?.displayName || entry.team?.displayName || `Driver ${i + 1}`
                  const team = entry.team?.displayName || entry.athlete?.team?.displayName || ''
                  const stats = entry.stats || []
                  const get = (n) => stats.find(s => s.name === n || s.displayName === n)?.displayValue ?? '—'
                  const rank = get('rank') !== '—' ? get('rank') : i + 1
                  const pts  = get('points')
                  const wins = get('wins')
                  const amcl = isArrowMcLaren(name) || isArrowMcLaren(team)

                  return (
                    <tr
                      key={entry.athlete?.id || i}
                      className={`border-b border-slate-800/40 transition-colors ${
                        amcl ? 'bg-orange-950/20' : 'hover:bg-slate-800/20'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-slate-600 text-xs tabular-nums">{rank}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {amcl && <div className="w-1.5 h-1.5 rounded-full bg-orange-400/80 flex-shrink-0" />}
                          <span className={`font-medium ${amcl ? 'text-orange-300/90' : 'text-slate-400'}`}>
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 text-xs hidden sm:table-cell">{team || '—'}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums hidden sm:table-cell">{wins}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-400 tabular-nums">{pts}</td>
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
