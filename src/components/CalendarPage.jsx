import { useState, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO,
} from 'date-fns'
import { supabase } from '../supabaseClient'

const STATUS_CHIP = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-700',
  review:      'bg-amber-50 text-amber-700',
  done:        'bg-green-50 text-green-700',
  archived:    'bg-gray-50 text-gray-400',
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
        <h1 className="text-lg font-semibold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Today
          </button>
          <span className="text-gray-800 font-medium text-sm w-32 text-center">
            {format(month, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm text-center py-20">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-7 mb-1">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
            {days.map(day => {
              const dayCards = cardsForDay(day)
              const inMonth  = isSameMonth(day, month)
              const today    = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => dayCards.length > 0 && setSelected({ day, cards: dayCards })}
                  className={`min-h-24 p-2 flex flex-col gap-1 transition-colors ${
                    inMonth ? 'bg-white' : 'bg-gray-50'
                  } ${dayCards.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                >
                  <span className={`text-xs font-medium self-start w-6 h-6 flex items-center justify-center rounded-full ${
                    today ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-600' : 'text-gray-300'
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
                      <span className="text-xs text-gray-400 pl-1">+{dayCards.length - 3} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            {Object.entries({ 'To Do': STATUS_CHIP.todo, 'In Progress': STATUS_CHIP.in_progress, 'Review': STATUS_CHIP.review, 'Done': STATUS_CHIP.done, 'Archived': STATUS_CHIP.archived })
              .map(([label, cls]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${cls.split(' ')[0]}`} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
          </div>
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {format(selected.day, 'EEEE, MMMM d')}
              </h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {selected.cards.map(card => (
                <div key={card.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm text-gray-800 font-medium leading-snug">{card.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${STATUS_CHIP[card.status] || STATUS_CHIP.todo}`}>
                      {card.status.replace('_', ' ')}
                    </span>
                  </div>
                  {card.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
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
