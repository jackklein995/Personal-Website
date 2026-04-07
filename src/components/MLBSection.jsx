import { useState, useEffect } from 'react'

const DIVISIONS = [
  { id: 201, label: 'AL East'    },
  { id: 202, label: 'AL Central' },
  { id: 200, label: 'AL West'    },
  { id: 204, label: 'NL East'    },
  { id: 205, label: 'NL Central' },
  { id: 203, label: 'NL West'    },
]

export default function MLBSection() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    const year = new Date().getFullYear()
    fetch(
      `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason&hydrate=team`
    )
      .then(r => r.json())
      .then(data => { setRecords(data.records || []); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) return <div className="text-slate-600 text-sm text-center py-12">Loading…</div>
  if (error)   return <div className="text-red-500/70 text-sm text-center py-12">Failed to load standings.</div>

  return (
    <div className="space-y-6">
      {DIVISIONS.map(div => {
        const divRecord = records.find(r => r.division?.id === div.id)
        const teams = divRecord?.teamRecords || []

        return (
          <div key={div.id}>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-2">{div.label}</p>
            <div className="bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800/60 text-slate-600 text-xs uppercase tracking-wider bg-[#080f1e]/40">
                    <th className="px-4 py-2 text-left">Team</th>
                    <th className="px-4 py-2 text-right">W</th>
                    <th className="px-4 py-2 text-right">L</th>
                    <th className="px-4 py-2 text-right hidden sm:table-cell">PCT</th>
                    <th className="px-4 py-2 text-right">GB</th>
                    <th className="px-4 py-2 text-right hidden sm:table-cell">Str</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(record => {
                    const isRedSox = record.team?.name === 'Boston Red Sox'
                    return (
                      <tr
                        key={record.team?.id}
                        className={`border-b border-slate-800/40 transition-colors ${
                          isRedSox ? 'bg-blue-900/15' : 'hover:bg-slate-800/20'
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {isRedSox && <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 flex-shrink-0" />}
                            <span className={`font-medium ${isRedSox ? 'text-blue-400/80' : 'text-slate-400'}`}>
                              {record.team?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums">{record.wins}</td>
                        <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums">{record.losses}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums hidden sm:table-cell">{record.winningPercentage}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">
                          {!record.gamesBack || record.gamesBack === '-' ? '—' : record.gamesBack}
                        </td>
                        <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                          <span className={`text-xs font-medium ${
                            record.streak?.streakType === 'wins' ? 'text-emerald-500/70' : 'text-red-500/60'
                          }`}>
                            {record.streak?.streakCode || '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
