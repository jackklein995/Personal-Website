import { useState, useEffect } from 'react'

const F1_BASE = 'https://api.jolpi.ca/ergast/f1'

function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-2xl">🏎️</span>
      <h2 className="text-2xl font-bold text-white">{children}</h2>
    </div>
  )
}

function LoadingState() {
  return <div className="text-gray-500 py-8 text-center">Loading F1 data...</div>
}

function ErrorState() {
  return <div className="text-red-400 py-8 text-center">Failed to load F1 data. Please try again later.</div>
}

export default function F1Section() {
  const [schedule, setSchedule] = useState([])
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('schedule')

  useEffect(() => {
    const year = new Date().getFullYear()
    Promise.all([
      fetch(`${F1_BASE}/${year}.json`).then(r => r.json()),
      fetch(`${F1_BASE}/${year}/driverStandings.json`).then(r => r.json()),
    ])
      .then(([schedData, standData]) => {
        setSchedule(schedData.MRData?.RaceTable?.Races || [])
        const lists = standData.MRData?.StandingsTable?.StandingsLists || []
        setStandings(lists[0]?.DriverStandings || [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) return <section><SectionHeader>Formula 1</SectionHeader><LoadingState /></section>
  if (error) return <section><SectionHeader>Formula 1</SectionHeader><ErrorState /></section>

  const now = new Date()
  const upcoming = schedule.filter(r => new Date(r.date) >= now)
  const past = schedule.filter(r => new Date(r.date) < now).reverse()

  return (
    <section>
      <SectionHeader>Formula 1 — {new Date().getFullYear()} Season</SectionHeader>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['schedule', 'standings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming Races</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcoming.slice(0, 9).map(race => (
                  <RaceCard key={race.round} race={race} upcoming />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {past.slice(0, 6).map(race => (
                  <RaceCard key={race.round} race={race} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'standings' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left w-10">Pos</th>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Constructor</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Wins</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr
                  key={s.Driver.driverId}
                  className={`border-b border-gray-800/50 ${i === 0 ? 'bg-red-950/20' : 'hover:bg-gray-800/50'} transition-colors`}
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.position}</td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">
                      {s.Driver.givenName} {s.Driver.familyName}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 uppercase">{s.Driver.nationality}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{s.Constructors[0]?.name}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{s.points}</td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">{s.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function RaceCard({ race, upcoming }) {
  const date = new Date(race.date)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 ${upcoming ? 'border-red-800/50' : 'border-gray-800'}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs text-gray-500 font-mono">Rd {race.round}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${upcoming ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
          {dateStr}
        </span>
      </div>
      <p className="text-white font-semibold text-sm leading-snug">{race.raceName}</p>
      <p className="text-gray-500 text-xs mt-1">{race.Circuit?.circuitName}</p>
      <p className="text-gray-600 text-xs">{race.Circuit?.Location?.country}</p>
    </div>
  )
}
