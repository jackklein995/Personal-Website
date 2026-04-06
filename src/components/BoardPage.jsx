import { useState, useEffect, useRef } from 'react'
import { format, startOfWeek, addDays, isToday, isSameDay, parseISO } from 'date-fns'
import { supabase } from '../supabaseClient'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',      accent: 'border-gray-300'  },
  { id: 'in_progress', label: 'In Progress', accent: 'border-blue-400'  },
  { id: 'review',      label: 'Review',      accent: 'border-amber-400' },
  { id: 'done',        label: 'Done',        accent: 'border-green-400' },
]

const STATUS_CHIP = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-700',
  review:      'bg-amber-50 text-amber-700',
  done:        'bg-green-50 text-green-700',
}

const STATUS_DOT = {
  todo:        'bg-gray-400',
  in_progress: 'bg-blue-500',
  review:      'bg-amber-500',
  done:        'bg-green-500',
}

function weekMonday() {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

// ─── Card Modal ───────────────────────────────────────────────────────────────
function CardModal({ mode, initialCard, initialStatus, onSave, onDelete, onClose }) {
  const [title, setTitle]           = useState(initialCard?.title || '')
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
    await onSave({ title: title.trim(), description: desc.trim(), due_date: dueDate || null, status })
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
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-10 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            {isEdit ? 'Edit Card' : 'New Card'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Card title"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Due date + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
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
              <label className="text-xs text-gray-500 font-medium mb-2 block">
                Comments {comments.length > 0 && `(${comments.length})`}
              </label>

              {comments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {comments.map(c => (
                    <div key={c.id} className="group flex gap-2.5 items-start bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-relaxed">{c.body}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(c.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
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
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button
                  onClick={handleAddComment}
                  disabled={postingComment || !newComment.trim()}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm rounded-lg transition-colors font-medium"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          {isEdit ? (
            <button
              onClick={onDelete}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Delete card
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
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

  async function handleSave({ title, description, due_date, status }) {
    if (modal.mode === 'add') {
      const { data, error } = await supabase
        .from('kanban_cards')
        .insert({ title, description, status, due_date, week_start: format(weekMonday(), 'yyyy-MM-dd') })
        .select().single()
      if (!error && data) setCards(prev => [...prev, data])
    } else {
      const { error } = await supabase
        .from('kanban_cards')
        .update({ title, description, due_date, status })
        .eq('id', modal.card.id)
      if (!error) setCards(prev => prev.map(c => c.id === modal.card.id ? { ...c, title, description, due_date, status } : c))
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
          <h1 className="text-lg font-semibold text-gray-900">Weekly Board</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {format(ws, 'MMM d')} – {format(addDays(ws, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => setCloseConfirm(true)}
          className="flex-shrink-0 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
        >
          Close Week
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20 text-sm">Loading…</div>
      ) : (
        <>
          {/* Kanban columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {COLUMNS.map(col => {
              const colCards = cards.filter(c => c.status === col.id)
              return (
                <div
                  key={col.id}
                  className={`flex flex-col rounded-xl bg-white border border-gray-200 border-t-2 ${col.accent} min-h-48`}
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, col.id)}
                >
                  <div className="flex items-center justify-between px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 tracking-wide">{col.label}</span>
                      <span className="text-xs text-gray-400 tabular-nums">{colCards.length}</span>
                    </div>
                    <button
                      onClick={() => setModal({ mode: 'add', status: col.id })}
                      className="text-gray-300 hover:text-gray-600 transition-colors w-5 h-5 flex items-center justify-center rounded"
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
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Due This Week</p>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map(day => {
                const dayCards = cards.filter(c => c.due_date && isSameDay(parseISO(c.due_date), day))
                const today = isToday(day)
                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-lg p-2 min-h-20 border ${
                      today ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <p className={`text-xs mb-1.5 ${today ? 'text-blue-500' : 'text-gray-400'}`}>
                      <span className="block font-medium">{format(day, 'EEE')}</span>
                      <span className={`text-sm font-medium ${today ? 'text-blue-600' : 'text-gray-500'}`}>
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setCloseConfirm(false)}
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Close this week?</h2>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-medium text-gray-800">{doneCount} Done</span> item{doneCount !== 1 ? 's' : ''} will be archived to the Backlog.
            </p>
            <p className="text-gray-400 text-sm mb-6">Unfinished items carry over automatically.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCloseConfirm(false)} className="px-3 py-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors">
                Cancel
              </button>
              <button onClick={closeWeek} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
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
      className="group bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="cursor-pointer" onClick={onClick}>
        <p className="text-sm text-gray-800 leading-snug font-medium">{card.title}</p>
        {card.description && (
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{card.description}</p>
        )}
        {card.due_date && (
          <p className="text-xs text-gray-400 mt-1.5">Due {format(parseISO(card.due_date), 'MMM d')}</p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {idx > 0 && (
          <button
            onClick={e => { e.stopPropagation(); onMove(card.id, columns[idx - 1].id) }}
            className="text-xs text-gray-400 hover:text-gray-700 px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            ← {columns[idx - 1].label}
          </button>
        )}
        {idx < columns.length - 1 && (
          <button
            onClick={e => { e.stopPropagation(); onMove(card.id, columns[idx + 1].id) }}
            className="text-xs text-gray-400 hover:text-gray-700 px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors ml-auto"
          >
            {columns[idx + 1].label} →
          </button>
        )}
      </div>
    </div>
  )
}
