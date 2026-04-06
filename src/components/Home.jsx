import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { format, isToday, parseISO } from 'date-fns'
import { supabase } from '../supabaseClient'

const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

const STATUS_LABELS = {
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
}

const STATUS_DOT = {
  todo:        'bg-gray-400',
  in_progress: 'bg-blue-500',
  review:      'bg-amber-500',
  done:        'bg-green-500',
}

const STATUS_TEXT = {
  todo:        'text-gray-500',
  in_progress: 'text-blue-600',
  review:      'text-amber-600',
  done:        'text-green-600',
}

const STATUS_COUNT_COLOR = {
  todo:        'text-gray-700',
  in_progress: 'text-blue-600',
  review:      'text-amber-600',
}

const NAV_CARDS = [
  {
    to: '/board',
    label: 'Board',
    desc: 'Weekly kanban — To Do, In Progress, Review, Done.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    to: '/backlog',
    label: 'Backlog',
    desc: 'Archived completed items, organized by week.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    desc: 'Monthly view of all cards by due date.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/sports',
    label: 'Sports',
    desc: 'F1 standings, MLB, and golf rankings.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

export default function Home() {
  const [cards, setCards]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('kanban_cards')
      .select('id, title, status, due_date')
      .neq('status', 'archived')
      .order('due_date', { ascending: true })
      .then(({ data }) => { setCards(data || []); setLoading(false) })
  }, [])

  const activeCards  = cards.filter(c => c.status !== 'done')
  const dueToday     = cards.filter(c => c.due_date && isToday(parseISO(c.due_date)))
  const statusCounts = ['todo', 'in_progress', 'review'].map(s => ({
    status: s,
    count: activeCards.filter(c => c.status === s).length,
  })).filter(s => s.count > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">

      {/* Date + greeting */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">
          {format(now, 'EEEE, MMMM d, yyyy')}
        </p>
        <p className="text-gray-500 text-sm">{greeting}</p>
      </div>

      {/* Widgets */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Open items */}
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Open Items</p>
            {activeCards.length === 0 ? (
              <p className="text-sm text-gray-400">Nothing open — all clear.</p>
            ) : statusCounts.length === 0 ? (
              <p className="text-sm text-gray-500">{activeCards.length} items in Done</p>
            ) : (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {statusCounts.map(({ status, count }) => (
                  <div key={status} className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-semibold tabular-nums ${STATUS_COUNT_COLOR[status]}`}>
                      {count}
                    </span>
                    <span className="text-xs text-gray-400">{STATUS_LABELS[status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Due today */}
          <Link
            to="/board"
            className="group bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Due Today</p>
            {dueToday.length === 0 ? (
              <p className="text-sm text-gray-400">Nothing due today.</p>
            ) : (
              <ul className="space-y-2">
                {dueToday.map(card => (
                  <li key={card.id} className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[card.status]}`} />
                    <span className="text-sm text-gray-700 truncate flex-1">{card.title}</span>
                    <span className={`text-xs flex-shrink-0 ${STATUS_TEXT[card.status]}`}>
                      {STATUS_LABELS[card.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Link>
        </div>
      )}

      {/* Nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {NAV_CARDS.map(({ to, label, desc, icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-start gap-3.5 bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
          >
            <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700 transition-colors flex-shrink-0">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 mb-0.5 group-hover:text-gray-900 transition-colors">
                {label}
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
