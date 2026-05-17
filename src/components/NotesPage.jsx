import { useState, useEffect, useRef, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../supabaseClient'

function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export default function NotesPage() {
  const [notes, setNotes]         = useState([])
  const [selected, setSelected]   = useState(null)
  const [title, setTitle]         = useState('')
  const [body, setBody]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [mobileView, setMobileView] = useState('list') // 'list' | 'note'
  const bodyRef = useRef(null)

  useEffect(() => {
    supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setNotes(data || [])
        setLoading(false)
      })
  }, [])

  // Auto-save on title/body change
  const save = useCallback(async (noteId, newTitle, newBody) => {
    if (!noteId) return
    setSaving(true)
    setSaved(false)
    const updated_at = new Date().toISOString()
    await supabase
      .from('notes')
      .update({ title: newTitle || 'Untitled', body: newBody, updated_at })
      .eq('id', noteId)
    setNotes(prev => prev
      .map(n => n.id === noteId ? { ...n, title: newTitle || 'Untitled', body: newBody, updated_at } : n)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const debouncedSave = useDebounce(save, 800)

  function handleTitleChange(e) {
    setTitle(e.target.value)
    debouncedSave(selected, e.target.value, body)
  }

  function handleBodyChange(e) {
    setBody(e.target.value)
    debouncedSave(selected, title, e.target.value)
  }

  function selectNote(note) {
    setSelected(note.id)
    setTitle(note.title)
    setBody(note.body || '')
    setMobileView('note')
    setTimeout(() => bodyRef.current?.focus(), 50)
  }

  async function newNote() {
    const { data, error } = await supabase
      .from('notes')
      .insert({ title: 'Untitled', body: '' })
      .select().single()
    if (!error && data) {
      setNotes(prev => [data, ...prev])
      selectNote(data)
    }
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selected === id) {
      setSelected(null)
      setTitle('')
      setBody('')
      setMobileView('list')
    }
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.body || '').toLowerCase().includes(search.toLowerCase())
  )

  const selectedNote = notes.find(n => n.id === selected)

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">

      {/* Sidebar */}
      <div className={`
        flex flex-col w-full sm:w-72 lg:w-80 flex-shrink-0
        border-r border-slate-800/50 bg-[#080d1a]
        ${mobileView === 'note' ? 'hidden sm:flex' : 'flex'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/50">
          <h1 className="text-sm font-semibold text-slate-300">Notes</h1>
          <button
            onClick={newNote}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all"
            title="New note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-slate-800/50">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full bg-[#0c1a2e]/60 border border-slate-800/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-400 placeholder-slate-700 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-slate-700 text-xs text-center py-8">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-slate-700 text-xs">
                {search ? 'No notes match your search.' : 'No notes yet.'}
              </p>
              {!search && (
                <button onClick={newNote} className="mt-2 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                  Create your first note →
                </button>
              )}
            </div>
          ) : (
            <ul>
              {filtered.map(note => (
                <li key={note.id}>
                  <button
                    onClick={() => selectNote(note)}
                    className={`w-full text-left px-4 py-3.5 border-b border-slate-800/40 transition-colors group ${
                      selected === note.id
                        ? 'bg-[#0c1a2e]/80 border-l-2 border-l-blue-600/50'
                        : 'hover:bg-[#0c1a2e]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${selected === note.id ? 'text-slate-200' : 'text-slate-400'}`}>
                        {note.title || 'Untitled'}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                        className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-500/60 transition-all flex-shrink-0 mt-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">
                      {note.body ? note.body.split('\n')[0] : 'No content'}
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      {format(parseISO(note.updated_at), 'MMM d, yyyy')}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Count */}
        {notes.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-800/50">
            <p className="text-xs text-slate-700">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className={`
        flex-1 flex flex-col bg-[#070d1f]
        ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}
      `}>
        {selected ? (
          <>
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/50 flex-shrink-0">
              <button
                onClick={() => setMobileView('list')}
                className="sm:hidden flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Notes
              </button>
              <p className="text-xs text-slate-700 ml-auto">
                {saving ? 'Saving…' : saved ? 'Saved' : selectedNote ? format(parseISO(selectedNote.updated_at), 'MMM d, yyyy · h:mm a') : ''}
              </p>
            </div>

            {/* Title */}
            <div className="px-8 pt-8 pb-2 flex-shrink-0">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled"
                className="w-full bg-transparent text-2xl font-semibold text-slate-200 placeholder-slate-700 focus:outline-none"
              />
            </div>

            {/* Body */}
            <div className="flex-1 px-8 pb-8 overflow-y-auto">
              <textarea
                ref={bodyRef}
                value={body}
                onChange={handleBodyChange}
                placeholder="Start writing…"
                className="w-full h-full bg-transparent text-sm text-slate-400 placeholder-slate-700 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#0c1a2e]/60 border border-slate-800/60 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="text-slate-600 text-sm mb-1">No note selected</p>
              <button onClick={newNote} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Create a new note →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
