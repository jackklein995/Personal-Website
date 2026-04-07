import { useState, useEffect } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { supabase } from '../supabaseClient'

function weekLabel(ws) {
  const d = parseISO(ws)
  return `Week of ${format(d, 'MMM d')} – ${format(addDays(d, 6), 'MMM d, yyyy')}`
}

export default function BacklogPage() {
  const [weeks, setWeeks]               = useState([])
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [cards, setCards]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [cardsLoading, setCardsLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('kanban_cards')
      .select('week_start')
      .eq('status', 'archived')
      .order('week_start', { ascending: false })
      .then(({ data }) => {
        const unique = [...new Set((data || []).map(d => d.week_start))]
        setWeeks(unique)
        if (unique.length > 0) setSelectedWeek(unique[0])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedWeek) return
    setCardsLoading(true)
    supabase
      .from('kanban_cards')
      .select('*')
      .eq('status', 'archived')
      .eq('week_start', selectedWeek)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setCards(data || []); setCardsLoading(false) })
  }, [selectedWeek])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-300 mb-1">Backlog</h1>
      <p className="text-slate-600 text-sm mb-8">Completed items archived when closing a week.</p>

      {loading ? (
        <div className="text-slate-600 text-center py-20 text-sm">Loading…</div>
      ) : weeks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-600 text-sm">No archived items yet.</p>
          <p className="text-slate-700 text-xs mt-1">Close a week on the Board to archive Done items here.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <select
              value={selectedWeek || ''}
              onChange={e => setSelectedWeek(e.target.value)}
              className="bg-[#0c1a2e]/70 border border-slate-700/50 text-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-600 w-full sm:w-auto"
            >
              {weeks.map(w => (
                <option key={w} value={w}>{weekLabel(w)}</option>
              ))}
            </select>
          </div>

          {cardsLoading ? (
            <div className="text-slate-600 text-sm text-center py-8">Loading…</div>
          ) : cards.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">No cards for this week.</p>
          ) : (
            <div>
              <p className="text-xs text-slate-600 mb-3">
                {cards.length} completed item{cards.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-1.5">
                {cards.map(card => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between gap-4 bg-[#0c1a2e]/60 border border-slate-800/50 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <svg className="w-4 h-4 text-emerald-600/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-500 truncate">{card.title}</span>
                    </div>
                    {card.due_date && (
                      <span className="text-xs text-slate-700 flex-shrink-0">
                        Due {format(parseISO(card.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
