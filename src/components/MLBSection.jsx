import { useState, useEffect } from 'react'

const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3'

export default function MLBSection() {
  const [team, setTeam] = useState(null)
  const [lastEvents, setLastEvents] = useState([])
  const [nextEvents, setNextEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState('scores')

  useEffect(() => {
    // Search for Boston Red Sox
    fetch(`${SPORTSDB_BASE}/searchteams.php?t=Boston+Red+Sox`)
      .then(r => r.json())
      .then(data => {
        const redSox = data.teams?.[0]
        if (!redSox) throw new Error('Team not found')
        setTeam(redSox)
        return Promise.all([
          fetch(`${SPORTSDB_BASE}/eventslast.php?id=${redSox.idTeam}`).then(r => r.json()),
          fetch(`${SPORTSDB_BASE}/eventsnext.php?id=${redSox.idTeam}`).then(r => r.json()),
        ])
      })
      .then(([lastData, nextData]) => {
        const last = (lastData.results || []).slice().reverse()
        setLastEvents(last)
        setNextEvents(nextData.events || [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">⚾</span>
        <h2 className="text-2xl font-bold text-white">Boston Red Sox</h2>
        {team?.strLeague && (
          <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded-full">{team.strLeague}</span>
        )}
      </div>

      {loading && <div className="text-gray-500 py-8 text-center">Loading Red Sox data...</div>}
      {error && <div className="text-red-400 py-8 text-center">Failed to load Red Sox data.</div>}

      {!loading && !error && (
        <>
          {/* Team header */}
          {team && (
            <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              {team.strTeamBadge && (
                <img
                  src={team.strTeamBadge}
                  alt="Red Sox"
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <p className="text-white font-bold text-lg">{team.strTeam}</p>
                <p className="text-gray-400 text-sm">{team.strStadium} · {team.strLocation}</p>
                {team.strDescriptionEN && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2 max-w-xl">
                    {team.strDescriptionEN.slice(0, 160)}...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('scores')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'scores' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Recent Scores
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Upcoming Games
            </button>
          </div>

          {activeTab === 'scores' && (
            <div className="space-y-2">
              {lastEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent scores available.</p>
              ) : (
                lastEvents.map(event => (
                  <GameRow key={event.idEvent} event={event} teamName="Boston Red Sox" />
                ))
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-2">
              {nextEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming games available.</p>
              ) : (
                nextEvents.map(event => (
                  <GameRow key={event.idEvent} event={event} teamName="Boston Red Sox" upcoming />
                ))
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function GameRow({ event, teamName, upcoming }) {
  const isHome = event.strHomeTeam === teamName
  const opponent = isHome ? event.strAwayTeam : event.strHomeTeam
  const soxScore = isHome ? event.intHomeScore : event.intAwayScore
  const oppScore = isHome ? event.intAwayScore : event.intHomeScore
  const hasScore = soxScore != null && oppScore != null

  let result = null
  if (hasScore) {
    const soxWon = parseInt(soxScore) > parseInt(oppScore)
    result = soxWon ? 'W' : 'L'
  }

  const dateStr = event.strDate
    ? new Date(event.strDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '—'

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900 border rounded-xl px-4 py-3 ${upcoming ? 'border-blue-800/40' : 'border-gray-800'}`}>
      <div className="flex items-center gap-3">
        {!upcoming && hasScore && (
          <span className={`text-xs font-bold w-6 text-center ${result === 'W' ? 'text-green-400' : 'text-red-400'}`}>
            {result}
          </span>
        )}
        <div>
          <p className="text-white font-medium text-sm">
            <span className="text-gray-400">{isHome ? 'vs' : '@'}</span>{' '}
            {opponent}
          </p>
          <p className="text-gray-500 text-xs">{event.strVenue || (isHome ? 'Fenway Park' : '')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {hasScore && (
          <span className={`font-mono font-bold px-3 py-1 rounded-lg ${
            result === 'W' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
          }`}>
            {soxScore} – {oppScore}
          </span>
        )}
        <span className={`px-2 py-1 rounded-full ${upcoming ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
          {dateStr}
        </span>
        {event.strTime && upcoming && (
          <span className="text-gray-600">{event.strTime.slice(0, 5)}</span>
        )}
      </div>
    </div>
  )
}
