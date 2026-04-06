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

  if (loading) return <div className="text-gray-400 text-sm text-center py-12">Loading…</div>
  if (error)   return <div className="text-red-500 text-sm text-center py-12">Failed to load data.</div>

  return (
    <div className="space-y-6">
      {nextRace && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Next Race</p>
            <p className="text-sm font-semibold text-gray-900">{nextRace.raceName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {nextRace.Circuit?.circuitName} · {nextRace.Circuit?.Location?.country}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">Round {nextRace.round}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {new Date(nextRace.date).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
          Driver Standings — {new Date().getFullYear()}
        </p>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider bg-gray-50">
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
                  className={`border-b border-gray-100 transition-colors ${
                    i === 0 ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-2.5 text-gray-400 text-xs tabular-nums">{s.position}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    {s.Driver.givenName} {s.Driver.familyName}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs hidden sm:table-cell">
                    {s.Constructors[0]?.name}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-800 tabular-nums">
                    {s.points}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums hidden sm:table-cell">
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
