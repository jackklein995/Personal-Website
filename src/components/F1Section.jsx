import { useState, useEffect } from 'react'

const BASE = 'https://api.jolpi.ca/ergast/f1'

export default function F1Section() {
  const [standings, setStandings] = useState([])
  const [nextRace, setNextRace]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)

  useEffect(() => {
    const year = new Date().getFullYear()
    Promise.all([
      fetch(`${BASE}/${year}/driverStandings.json`).then(r => r.json()),
      fetch(`${BASE}/current/next.json`).then(r => r.json()),
    ])
      .then(([sd, nd]) => {
        const lists = sd.MRData?.StandingsTable?.StandingsLists || []
        setStandings(lists[0]?.DriverStandings || [])
        setNextRace(nd.MRData?.RaceTable?.Races?.[0] || null)
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return <div className="text-slate-600 text-sm text-center py-12">Loading…</div>
  if (error)   return <div className="text-red-500/70 text-sm text-center py-12">Failed to load data.</div>

  return (
    <div className="space-y-6">
      {nextRace && (
        <div className="bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Next Race</p>
            <p className="text-sm font-semibold text-slate-300">{nextRace.raceName}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {nextRace.Circuit?.circuitName} · {nextRace.Circuit?.Location?.country}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-600">Round {nextRace.round}</p>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              {new Date(nextRace.date).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

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
                <th className="px-4 py-2.5 text-left hidden sm:table-cell">Constructor</th>
                <th className="px-4 py-2.5 text-right">Pts</th>
                <th className="px-4 py-2.5 text-right hidden sm:table-cell">Wins</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr
                  key={s.Driver.driverId}
                  className={`border-b border-slate-800/40 transition-colors ${
                    i === 0 ? 'bg-amber-900/10' : 'hover:bg-slate-800/20'
                  }`}
                >
                  <td className="px-4 py-2.5 text-slate-600 text-xs tabular-nums">{s.position}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-400">
                    {s.Driver.givenName} {s.Driver.familyName}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs hidden sm:table-cell">
                    {s.Constructors[0]?.name}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-400 tabular-nums">
                    {s.points}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums hidden sm:table-cell">
                    {s.wins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
