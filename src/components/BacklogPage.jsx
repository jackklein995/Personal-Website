import { useState, useEffect, useRef } from 'react'
import { format, addDays, parseISO, startOfWeek, addWeeks } from 'date-fns'
import { supabase } from '../supabaseClient'

function weekLabel(ws) {
  const d = parseISO(ws)
  return `Week of ${format(d, 'MMM d')} – ${format(addDays(d, 6), 'MMM d, yyyy')}`
}

function weekMonday(offset = 0) {
  const base = startOfWeek(new Date(), { weekStartsOn: 1 })
  return addWeeks(base, offset)
}

function fmt(date) {
  return format(date, 'yyyy-MM-dd')
}

const COLUMNS = [
  { id: 'todo',        label: 'To Do'       },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review',      label: 'Review'      },
  { id: 'done',        label: 'Done'        },
]

const PRIORITY_DOT = {
  high:   'bg-red-500/70',
  medium: 'bg-amber-500/50',
  low:    'bg-slate-600/70',
}

// ─── Planned Item Modal ───────────────────────────────────────────────────────
function ItemModal({ item, weekKey, onSave, onDelete, onClose }) {
  const [title, setTitle]       = useState(item?.title || '')
  const [topic, setTopic]       = useState(item?.topic || '')
  const [desc, setDesc]         = useState(item?.description || '')
  const [priority, setPriority] = useState(item?.priority || 'medium')
  const [status, setStatus]     = useState(item?.status || 'todo')
  const [dueDate, setDueDate]   = useState(item?.due_date || '')
  const [saving, setSaving]     = useState(false)
  const titleRef = useRef(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onSave({
      title: title.trim(),
      topic: topic.trim(),
      description: desc.trim(),
      priority,
      status,
      due_date: dueDate || null,
      week_start: weekKey,
    })
    setSaving(false)
  }

  const isEdit = !!item

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-10 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0c1823] border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-800/60">
          <h2 className="text-sm font-semibold text-slate-300">{isEdit ? 'Edit Planned Item' : 'Plan a Task'}</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-slate-600 font-medium mb-1.5 block">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Task title"
              className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="text-xs text-slate-600 font-medium mb-1.5 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Frontend, Infra, Design…"
              className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-600 font-medium mb-1.5 block">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Due date + Status + Priority */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1.5 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-slate-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1.5 block">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-slate-600 transition-colors"
              >
                {COLUMNS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1.5 block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-slate-600 transition-colors"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
          {isEdit ? (
            <button onClick={onDelete} className="text-xs text-slate-700 hover:text-red-500/70 transition-colors">
              Delete
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 bg-blue-700/70 hover:bg-blue-600/70 disabled:opacity-40 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-blue-600/30"
            >
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── History Section ──────────────────────────────────────────────────────────
function HistorySection() {
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

  if (loading) return <div className="text-slate-600 text-sm text-center py-12">Loading…</div>

  if (weeks.length === 0) return (
    <div className="text-center py-12">
      <p className="text-slate-600 text-sm">No archived weeks yet.</p>
      <p className="text-slate-700 text-xs mt-1">Close a week on the Board to archive Done items here.</p>
    </div>
  )

  return (
    <div>
      <div className="mb-5">
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
        <p className="text-slate-600 text-sm py-4">No cards for this week.</p>
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
                  <div className="min-w-0">
                    <span className="text-sm text-slate-500 truncate block">{card.title}</span>
                    {card.topic && <span className="text-xs text-slate-700">{card.topic}</span>}
                  </div>
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
    </div>
  )
}

// ─── Planning Section ─────────────────────────────────────────────────────────
function PlanningSection() {
  const WEEKS = [1, 2, 3, 4].map(offset => ({
    offset,
    date: weekMonday(offset),
    key: fmt(weekMonday(offset)),
    label: `${format(weekMonday(offset), 'MMM d')} – ${format(addDays(weekMonday(offset), 6), 'MMM d')}`,
  }))

  const [items, setItems]     = useState({})
  const [expanded, setExpanded] = useState({ [WEEKS[0].key]: true })
  const [modal, setModal]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const keys = WEEKS.map(w => w.key)
    supabase
      .from('planned_items')
      .select('*')
      .in('week_start', keys)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const grouped = {}
        keys.forEach(k => { grouped[k] = [] })
        ;(data || []).forEach(item => {
          if (grouped[item.week_start]) grouped[item.week_start].push(item)
        })
        setItems(grouped)
        setLoading(false)
      })
  }, [])

  async function handleSave(fields) {
    if (modal.item) {
      const { error } = await supabase.from('planned_items').update(fields).eq('id', modal.item.id)
      if (!error) {
        setItems(prev => ({
          ...prev,
          [modal.weekKey]: prev[modal.weekKey].map(i => i.id === modal.item.id ? { ...i, ...fields } : i),
        }))
      }
    } else {
      const { data, error } = await supabase.from('planned_items').insert(fields).select().single()
      if (!error && data) {
        setItems(prev => ({ ...prev, [modal.weekKey]: [...(prev[modal.weekKey] || []), data] }))
      }
      if (error) { alert('Error: ' + error.message); return }
    }
    setModal(null)
  }

  async function handleDelete() {
    await supabase.from('planned_items').delete().eq('id', modal.item.id)
    setItems(prev => ({
      ...prev,
      [modal.weekKey]: prev[modal.weekKey].filter(i => i.id !== modal.item.id),
    }))
    setModal(null)
  }

  function toggleExpanded(key) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) return <div className="text-slate-600 text-sm text-center py-12">Loading…</div>

  return (
    <div className="space-y-3">
      {WEEKS.map(({ key, label, offset }) => {
        const weekItems = items[key] || []
        const isOpen = expanded[key]

        return (
          <div key={key} className="bg-[#0c1a2e]/60 border border-slate-700/40 rounded-xl overflow-hidden">
            {/* Week header */}
            <button
              onClick={() => toggleExpanded(key)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#0e1f35]/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-400">
                    {offset === 1 ? 'Next Week' : `In ${offset} Weeks`}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{label}</p>
                </div>
              </div>
              {weekItems.length > 0 && (
                <span className="text-xs text-slate-600 tabular-nums">{weekItems.length} planned</span>
              )}
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-4 pb-4 border-t border-slate-800/50">
                {/* Items */}
                {weekItems.length > 0 && (
                  <ul className="space-y-1.5 mt-3 mb-3">
                    {weekItems.map(item => (
                      <li
                        key={item.id}
                        onClick={() => setModal({ item, weekKey: key })}
                        className="group flex items-center gap-2.5 cursor-pointer hover:bg-[#0e1f35]/40 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                      >
                        {item.priority && item.priority !== 'medium' && (
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[item.priority]}`} />
                        )}
                        {(!item.priority || item.priority === 'medium') && (
                          <div className="w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-slate-400 block truncate">{item.title}</span>
                          {item.topic && <span className="text-xs text-slate-600">{item.topic}</span>}
                        </div>
                        {item.due_date && (
                          <span className="text-xs text-slate-700 flex-shrink-0">
                            {format(parseISO(item.due_date), 'MMM d')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add button */}
                <button
                  onClick={() => setModal({ item: null, weekKey: key })}
                  className="mt-2 flex items-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add task
                </button>
              </div>
            )}
          </div>
        )
      })}

      {modal && (
        <ItemModal
          item={modal.item}
          weekKey={modal.weekKey}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

// ─── Backlog Page ─────────────────────────────────────────────────────────────
export default function BacklogPage() {
  const [tab, setTab] = useState('history')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-3">Board</p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-200">Backlog</h1>
        <div className="mt-5 h-px w-12 bg-blue-700/60 rounded-full" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#080f1e]/60 border border-slate-800/60 rounded-lg p-1 w-fit mb-8">
        {[
          { id: 'history',  label: 'History'    },
          { id: 'planning', label: 'Plan Ahead'  },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.id
                ? 'bg-slate-800 text-slate-300 border border-slate-700/50'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history'  && <HistorySection />}
      {tab === 'planning' && <PlanningSection />}
    </div>
  )
}
