import { useState, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO,
} from 'date-fns'
import { supabase } from '../supabaseClient'

const STATUS_CHIP = {
  todo:        'bg-slate-800/60 text-slate-500',
  in_progress: 'bg-blue-900/30 text-blue-400/80',
  review:      'bg-amber-900/20 text-amber-400/80',
  done:        'bg-emerald-900/20 text-emerald-400/80',
  archived:    'bg-slate-800/30 text-slate-600',
}

function buildCalendarDays(month) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const end   = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const days = []
  let cur = start
  while (cur <= end) { days.push(cur); cur = addDays(cur, 1) }
  return days
}

export default function CalendarPage() {
  const [month, setMonth]       = useState(new Date())
  const [cards, setCards]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase
      .from('kanban_cards')
      .select('*')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .then(({ data }) => { setCards(data || []); setLoading(false) })
  }, [])

  const days = buildCalendarDays(month)
  const cardsForDay = (day) => cards.filter(c => c.due_date && isSameDay(parseISO(c.due_date), day))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-slate-300">Calendar</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-400 hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="px-3 py-1 text-sm text-slate-600 hover:text-slate-400 hover:bg-slate-800/50 rounded-md transition-colors"
          >
            Today
          </button>
          <span className="text-slate-400 font-medium text-sm w-32 text-center">
            {format(month, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-400 hover:bg-slate-800/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-600 text-sm text-center py-20">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-7 mb-1">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs text-slate-600 font-medium py-1.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-800/40 rounded-xl overflow-hidden border border-slate-800/50">
            {days.map(day => {
              const dayCards = cardsForDay(day)
              const inMonth  = isSameMonth(day, month)
              const today    = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => dayCards.length > 0 && setSelected({ day, cards: dayCards })}
                  className={`min-h-24 p-2 flex flex-col gap-1 transition-colors ${
                    inMonth ? 'bg-[#0c1a2e]/60' : 'bg-[#080d1a]/50'
                  } ${dayCards.length > 0 ? 'cursor-pointer hover:bg-[#0e1f35]/70' : ''}`}
                >
                  <span className={`text-xs font-medium self-start w-6 h-6 flex items-center justify-center rounded-full ${
                    today
                      ? 'bg-blue-600/60 text-blue-200 border border-blue-500/40'
                      : inMonth ? 'text-slate-500' : 'text-slate-700'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayCards.slice(0, 3).map(card => (
                      <div
                        key={card.id}
                        className={`text-xs px-1.5 py-0.5 rounded truncate ${STATUS_CHIP[card.status] || STATUS_CHIP.todo}`}
                        title={card.title}
                      >
                        {card.title}
                      </div>
                    ))}
                    {dayCards.length > 3 && (
                      <span className="text-xs text-slate-700 pl-1">+{dayCards.length - 3} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            {Object.entries({
              'To Do': STATUS_CHIP.todo,
              'In Progress': STATUS_CHIP.in_progress,
              'Review': STATUS_CHIP.review,
              'Done': STATUS_CHIP.done,
              'Archived': STATUS_CHIP.archived,
            }).map(([label, cls]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${cls.split(' ')[0]}`} />
                <span className="text-xs text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-[#0c1823] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">
                {format(selected.day, 'EEEE, MMMM d')}
              </h2>
              <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-slate-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {selected.cards.map(card => (
                <div key={card.id} className="bg-[#080f1e]/80 border border-slate-800/60 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm text-slate-400 font-medium leading-snug">{card.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${STATUS_CHIP[card.status] || STATUS_CHIP.todo}`}>
                      {card.status.replace('_', ' ')}
                    </span>
                  </div>
                  {card.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
