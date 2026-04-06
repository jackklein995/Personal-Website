import { useState, useEffect } from 'react'

const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3'

export default function IndyCarSection() {
  const [teams, setTeams] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('results')

  useEffect(() => {
    Promise.all([
      fetch(`${SPORTSDB_BASE}/search_all_teams.php?l=IndyCar`).then(r => r.json()),
      // IndyCar Series league ID in TheSportsDB is 4370
      fetch(`${SPORTSDB_BASE}/eventsseason.php?id=4370&s=2024`).then(r => r.json()),
    ])
      .then(([teamsData, eventsData]) => {
        setTeams(teamsData.teams || [])
        const allEvents = eventsData.events || []
        // Sort by date descending for recent results
        const sorted = allEvents
          .filter(e => e.strDate)
          .sort((a, b) => new Date(b.strDate) - new Date(a.strDate))
        setEvents(sorted)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const now = new Date()
  const recentResults = events.filter(e => new Date(e.strDate) < now).slice(0, 8)
  const upcomingRaces = events.filter(e => new Date(e.strDate) >= now).slice(0, 8)

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🏁</span>
        <h2 className="text-2xl font-bold text-white">IndyCar Series</h2>
      </div>

      {loading && <div className="text-gray-500 py-8 text-center">Loading IndyCar data...</div>}
      {error && <div className="text-red-400 py-8 text-center">Failed to load IndyCar data.</div>}

      {!loading && !error && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['results', 'upcoming', 'teams'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'results' && (
            <div className="space-y-2">
              {recentResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent results available.</p>
              ) : (
                recentResults.map(event => (
                  <EventRow key={event.idEvent} event={event} />
                ))
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-2">
              {upcomingRaces.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming races available.</p>
              ) : (
                upcomingRaces.map(event => (
                  <EventRow key={event.idEvent} event={event} upcoming />
                ))
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.length === 0 ? (
                <p className="text-gray-500">No team data available.</p>
              ) : (
                teams.map(team => (
                  <TeamCard key={team.idTeam} team={team} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function EventRow({ event, upcoming }) {
  const dateStr = event.strDate
    ? new Date(event.strDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-900 border rounded-xl px-4 py-3 ${upcoming ? 'border-indigo-800/50' : 'border-gray-800'}`}>
      <div>
        <p className="text-white font-medium text-sm">{event.strEvent}</p>
        <p className="text-gray-500 text-xs mt-0.5">{event.strVenue || event.strLeague}</p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        {event.intHomeScore != null && event.intAwayScore != null && (
          <span className="text-gray-300 font-mono bg-gray-800 px-2 py-1 rounded">
            {event.intHomeScore} – {event.intAwayScore}
          </span>
        )}
        <span className={`px-2 py-1 rounded-full ${upcoming ? 'bg-indigo-900/50 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
          {dateStr}
        </span>
      </div>
    </div>
  )
}

function TeamCard({ team }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
      {team.strTeamBadge ? (
        <img
          src={team.strTeamBadge}
          alt={team.strTeam}
          className="w-12 h-12 object-contain rounded"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-gray-600 text-xl">🏎</div>
      )}
      <div>
        <p className="text-white font-semibold text-sm">{team.strTeam}</p>
        {team.strCountry && <p className="text-gray-500 text-xs mt-0.5">{team.strCountry}</p>}
      </div>
    </div>
  )
}
