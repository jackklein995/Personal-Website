import { useState, useEffect, useRef } from 'react'
import { format, startOfWeek, addDays, isToday, isSameDay, parseISO } from 'date-fns'
import { supabase } from '../supabaseClient'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',      accent: 'border-slate-600',     bg: 'bg-[#0c1a2e]/60'           },
  { id: 'in_progress', label: 'In Progress', accent: 'border-blue-500/60',   bg: 'bg-blue-950/40'            },
  { id: 'review',      label: 'Review',      accent: 'border-amber-500/60',  bg: 'bg-amber-950/30'           },
  { id: 'done',        label: 'Done',        accent: 'border-emerald-500/60', bg: 'bg-emerald-950/30'        },
]

const STATUS_CHIP = {
  todo:        'bg-slate-800/60 text-slate-500',
  in_progress: 'bg-blue-900/30 text-blue-400/80',
  review:      'bg-amber-900/20 text-amber-400/80',
  done:        'bg-emerald-900/20 text-emerald-400/80',
}

const STATUS_DOT = {
  todo:        'bg-slate-600',
  in_progress: 'bg-blue-500/70',
  review:      'bg-amber-500/70',
  done:        'bg-emerald-500/70',
}

function weekMonday() {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

// ─── Card Modal ───────────────────────────────────────────────────────────────
function CardModal({ mode, initialCard, initialStatus, onSave, onDelete, onClose }) {
  const [title, setTitle]           = useState(initialCard?.title || '')
  const [topic, setTopic]           = useState(initialCard?.topic || '')
  const [desc, setDesc]             = useState(initialCard?.description || '')
  const [dueDate, setDueDate]       = useState(initialCard?.due_date || '')
  const [status, setStatus]         = useState(initialCard?.status || initialStatus || 'todo')
  const [comments, setComments]     = useState([])
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving]         = useState(false)
  const [postingComment, setPostingComment] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
    if (mode === 'edit' && initialCard?.id) {
      supabase
        .from('kanban_comments')
        .select('*')
        .eq('card_id', initialCard.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => setComments(data || []))
    }
  }, [])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), topic: topic.trim(), description: desc.trim(), due_date: dueDate || null, status })
    setSaving(false)
  }

  async function handleAddComment() {
    if (!newComment.trim()) return
    setPostingComment(true)
    const { data, error } = await supabase
      .from('kanban_comments')
      .insert({ card_id: initialCard.id, body: newComment.trim() })
      .select().single()
    if (!error && data) setComments(prev => [...prev, data])
    setNewComment('')
    setPostingComment(false)
  }

  async function handleDeleteComment(id) {
    await supabase.from('kanban_comments').delete().eq('id', id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const isEdit = mode === 'edit'

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-10 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0c1823] border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-800/60">
          <h2 className="text-sm font-semibold text-slate-300">
            {isEdit ? 'Edit Card' : 'New Card'}
          </h2>
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
              placeholder="Card title"
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

          {/* Due date + Status */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Comments — edit mode only */}
          {isEdit && (
            <div>
              <label className="text-xs text-slate-600 font-medium mb-2 block">
                Comments {comments.length > 0 && `(${comments.length})`}
              </label>

              {comments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {comments.map(c => (
                    <div key={c.id} className="group flex gap-2.5 items-start bg-[#080f1e]/80 border border-slate-800/60 rounded-lg px-3 py-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-400 leading-relaxed">{c.body}</p>
                        <p className="text-xs text-slate-700 mt-1">
                          {format(new Date(c.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-500/70 transition-all flex-shrink-0 mt-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment…"
                  className="flex-1 bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
                />
                <button
                  onClick={handleAddComment}
                  disabled={postingComment || !newComment.trim()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-400 text-sm rounded-lg transition-colors font-medium border border-slate-700/50"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800/60">
          {isEdit ? (
            <button
              onClick={onDelete}
              className="text-xs text-slate-700 hover:text-red-500/70 transition-colors"
            >
              Delete card
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 bg-blue-700/70 hover:bg-blue-600/70 disabled:opacity-40 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-blue-600/30"
            >
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Add Card'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Board Page ───────────────────────────────────────────────────────────────
export default function BoardPage() {
  const [cards, setCards]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [draggingId, setDraggingId]     = useState(null)
  const [modal, setModal]               = useState(null)
  const [closeConfirm, setCloseConfirm] = useState(false)

  useEffect(() => { fetchCards() }, [])

  async function fetchCards() {
    const { data } = await supabase
      .from('kanban_cards')
      .select('*')
      .neq('status', 'archived')
      .order('created_at', { ascending: true })
    setCards(data || [])
    setLoading(false)
  }

  async function handleSave({ title, topic, description, due_date, status }) {
    if (modal.mode === 'add') {
      const { data, error } = await supabase
        .from('kanban_cards')
        .insert({ title, topic, description, status, due_date, week_start: format(weekMonday(), 'yyyy-MM-dd') })
        .select().single()
      if (!error && data) setCards(prev => [...prev, data])
      if (error) { alert('Error adding card: ' + error.message); return }
    } else {
      const { error } = await supabase
        .from('kanban_cards')
        .update({ title, topic, description, due_date, status })
        .eq('id', modal.card.id)
      if (!error) setCards(prev => prev.map(c => c.id === modal.card.id ? { ...c, title, topic, description, due_date, status } : c))
    }
    setModal(null)
  }

  async function handleDelete() {
    await supabase.from('kanban_cards').delete().eq('id', modal.card.id)
    setCards(prev => prev.filter(c => c.id !== modal.card.id))
    setModal(null)
  }

  async function moveCard(id, newStatus) {
    const { error } = await supabase.from('kanban_cards').update({ status: newStatus }).eq('id', id)
    if (!error) setCards(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
  }

  async function closeWeek() {
    const ws = format(weekMonday(), 'yyyy-MM-dd')
    const doneIds = cards.filter(c => c.status === 'done').map(c => c.id)
    if (doneIds.length > 0) {
      await supabase.from('kanban_cards').update({ status: 'archived', week_start: ws }).in('id', doneIds)
      setCards(prev => prev.filter(c => c.status !== 'done'))
    }
    setCloseConfirm(false)
  }

  const onDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onDrop      = (e, status) => { e.preventDefault(); if (draggingId) moveCard(draggingId, status); setDraggingId(null) }

  const ws        = weekMonday()
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(ws, i))
  const doneCount = cards.filter(c => c.status === 'done').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-300">Weekly Board</h1>
          <p className="text-slate-600 text-sm mt-0.5">
            {format(ws, 'MMM d')} – {format(addDays(ws, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => setCloseConfirm(true)}
          className="flex-shrink-0 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-400 text-sm rounded-lg transition-colors"
        >
          Close Week
        </button>
      </div>

      {loading ? (
        <div className="text-slate-600 text-center py-20 text-sm">Loading…</div>
      ) : (
        <>
          {/* Kanban columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {COLUMNS.map(col => {
              const colCards = cards.filter(c => c.status === col.id)
              return (
                <div
                  key={col.id}
                  className={`flex flex-col rounded-xl ${col.bg} border border-slate-700/40 border-t-2 ${col.accent} min-h-48`}
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, col.id)}
                >
                  <div className="flex items-center justify-between px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 tracking-wide">{col.label}</span>
                      <span className="text-xs text-slate-700 tabular-nums">{colCards.length}</span>
                    </div>
                    <button
                      onClick={() => setModal({ mode: 'add', status: col.id })}
                      className="text-slate-700 hover:text-slate-400 transition-colors w-5 h-5 flex items-center justify-center rounded"
                      title={`Add to ${col.label}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 px-2 pb-2 space-y-1.5">
                    {colCards.map(card => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        columns={COLUMNS}
                        onDragStart={onDragStart}
                        onMove={moveCard}
                        onClick={() => setModal({ mode: 'edit', card })}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Due This Week */}
          <div>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-3">Due This Week</p>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map(day => {
                const dayCards = cards.filter(c => c.due_date && isSameDay(parseISO(c.due_date), day))
                const today = isToday(day)
                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-lg p-2 min-h-20 border ${
                      today
                        ? 'bg-blue-900/20 border-blue-700/40'
                        : 'bg-[#0c1a2e]/50 border-slate-800/50'
                    }`}
                  >
                    <p className={`text-xs mb-1.5 ${today ? 'text-blue-400/80' : 'text-slate-600'}`}>
                      <span className="block font-medium">{format(day, 'EEE')}</span>
                      <span className={`text-sm font-medium ${today ? 'text-blue-400' : 'text-slate-500'}`}>
                        {format(day, 'd')}
                      </span>
                    </p>
                    <div className="space-y-0.5">
                      {dayCards.map(card => (
                        <div
                          key={card.id}
                          onClick={() => setModal({ mode: 'edit', card })}
                          className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-75 ${STATUS_CHIP[card.status]}`}
                          title={card.title}
                        >
                          {card.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Card Modal */}
      {modal && (
        <CardModal
          mode={modal.mode}
          initialCard={modal.card}
          initialStatus={modal.status}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}

      {/* Close Week Modal */}
      {closeConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setCloseConfirm(false)}
        >
          <div className="bg-[#0c1823] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-base font-semibold text-slate-300 mb-1">Close this week?</h2>
            <p className="text-slate-500 text-sm mb-1">
              <span className="font-medium text-slate-400">{doneCount} Done</span> item{doneCount !== 1 ? 's' : ''} will be archived to the Backlog.
            </p>
            <p className="text-slate-600 text-sm mb-6">Unfinished items carry over automatically.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCloseConfirm(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={closeWeek} className="px-4 py-1.5 bg-blue-700/70 hover:bg-blue-600/70 border border-blue-600/30 text-slate-200 text-sm font-medium rounded-lg transition-colors">
                Archive & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────
function KanbanCard({ card, columns, onDragStart, onMove, onClick }) {
  const idx = columns.findIndex(c => c.id === card.status)

  return (
    <div
      draggable
      onDragStart={e => { e.stopPropagation(); onDragStart(e, card.id) }}
      className="group bg-[#0f1f35] border border-slate-700/60 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-slate-600/70 hover:bg-[#111f35] transition-all"
    >
      <div className="cursor-pointer" onClick={onClick}>
        <p className="text-sm text-slate-300 leading-snug font-medium">{card.title}</p>
        {card.topic && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.topic}</p>
        )}
        {card.due_date && (
          <p className="text-xs text-slate-600 mt-1.5">Due {format(parseISO(card.due_date), 'MMM d')}</p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {idx > 0 && (
          <button
            onClick={e => { e.stopPropagation(); onMove(card.id, columns[idx - 1].id) }}
            className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-0.5 bg-slate-800/80 hover:bg-slate-700/80 rounded transition-colors border border-slate-700/50"
          >
            ← {columns[idx - 1].label}
          </button>
        )}
        {idx < columns.length - 1 && (
          <button
            onClick={e => { e.stopPropagation(); onMove(card.id, columns[idx + 1].id) }}
            className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-0.5 bg-slate-800/80 hover:bg-slate-700/80 rounded transition-colors ml-auto border border-slate-700/50"
          >
            {columns[idx + 1].label} →
          </button>
        )}
      </div>
    </div>
  )
}
