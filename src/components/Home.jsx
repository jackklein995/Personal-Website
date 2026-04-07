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
  todo:        'bg-slate-600',
  in_progress: 'bg-blue-500/70',
  review:      'bg-amber-500/70',
  done:        'bg-emerald-500/70',
}

const STATUS_TEXT = {
  todo:        'text-slate-500',
  in_progress: 'text-blue-400/80',
  review:      'text-amber-400/80',
  done:        'text-emerald-400/80',
}

const STATUS_COUNT_COLOR = {
  todo:        'text-slate-400',
  in_progress: 'text-blue-400/80',
  review:      'text-amber-400/80',
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
  {
    to: '/todo',
    label: 'To Do',
    desc: 'Quick task list — add items, check them off.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Subtle background depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-16">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-3">
            {format(now, 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-200 mb-2">
            {greeting}, Jack.
          </h1>
          <p className="text-slate-500 text-sm">Here's what's on your plate today.</p>
          <div className="mt-5 h-px w-12 bg-blue-700/60 rounded-full" />
        </div>

        {/* Widgets */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Open items */}
            <div className="bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl px-5 py-5">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-4">Open Items</p>
              {activeCards.length === 0 ? (
                <p className="text-sm text-slate-600">Nothing open — all clear.</p>
              ) : statusCounts.length === 0 ? (
                <p className="text-sm text-slate-500">{activeCards.length} items in Done</p>
              ) : (
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {statusCounts.map(({ status, count }) => (
                    <div key={status} className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-semibold tabular-nums ${STATUS_COUNT_COLOR[status]}`}>
                        {count}
                      </span>
                      <span className="text-xs text-slate-600">{STATUS_LABELS[status]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Due today */}
            <Link
              to="/board"
              className="group bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl px-5 py-5 hover:border-slate-600/60 transition-all duration-200"
            >
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-4">Due Today</p>
              {dueToday.length === 0 ? (
                <p className="text-sm text-slate-600">Nothing due today.</p>
              ) : (
                <ul className="space-y-2.5">
                  {dueToday.map(card => (
                    <li key={card.id} className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[card.status]}`} />
                      <span className="text-sm text-slate-400 truncate flex-1">{card.title}</span>
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
        <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-3">Navigate</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NAV_CARDS.map(({ to, label, desc, icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-start gap-3 bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl p-4 hover:border-slate-600/60 hover:bg-[#0e1f35]/80 transition-all duration-200"
            >
              <div className="mt-0.5 p-1.5 bg-slate-800/60 border border-slate-700/40 rounded-lg text-slate-500 group-hover:text-slate-300 group-hover:border-slate-600/60 transition-colors flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300 mb-0.5 group-hover:text-slate-200 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-500 transition-colors">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
