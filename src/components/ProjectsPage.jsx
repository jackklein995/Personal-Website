import { useState, useEffect, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../supabaseClient'

const STATUS_OPTIONS = ['active', 'paused', 'done']

const STATUS_STYLE = {
  active: { dot: 'bg-blue-500/60',    text: 'text-blue-400/80',    badge: 'bg-blue-900/30 text-blue-400/80 border-blue-700/30'    },
  paused: { dot: 'bg-amber-500/60',   text: 'text-amber-400/80',   badge: 'bg-amber-900/20 text-amber-400/80 border-amber-700/30'  },
  done:   { dot: 'bg-emerald-500/60', text: 'text-emerald-400/80', badge: 'bg-emerald-900/20 text-emerald-400/80 border-emerald-700/30' },
}

const CATEGORY_OPTIONS = ['Work', 'Personal', 'Learning', 'Health', 'Finance', 'Creative', 'Other']

// ─── Modal ────────────────────────────────────────────────────────────────────
function ProjectModal({ project, onSave, onDelete, onClose }) {
  const [title, setTitle]       = useState(project?.title || '')
  const [desc, setDesc]         = useState(project?.description || '')
  const [status, setStatus]     = useState(project?.status || 'active')
  const [category, setCategory] = useState(project?.category || '')
  const [targetDate, setTargetDate] = useState(project?.target_date || '')
  const [progress, setProgress] = useState(project?.progress ?? 0)
  const [saving, setSaving]     = useState(false)
  const titleRef = useRef(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), description: desc.trim(), status, category, target_date: targetDate || null, progress })
    setSaving(false)
  }

  const isEdit = !!project

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-10 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0c1823] border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-800/60">
          <h2 className="text-sm font-semibold text-slate-300">{isEdit ? 'Edit Goal' : 'New Goal'}</h2>
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
              placeholder="Goal name"
              className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-600 font-medium mb-1.5 block">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What does success look like?"
              rows={3}
              className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1.5 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-slate-600 transition-colors"
              >
                <option value="">None</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1.5 block">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-slate-600 transition-colors"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Target date */}
          <div>
            <label className="text-xs text-slate-600 font-medium mb-1.5 block">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-600 font-medium">Progress</label>
              <span className="text-xs text-slate-500 tabular-nums">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-blue-500/70"
            />
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
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Add Goal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick }) {
  const s = STATUS_STYLE[project.status] || STATUS_STYLE.active
  const daysLeft = project.target_date
    ? Math.ceil((new Date(project.target_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div
      onClick={onClick}
      className="group bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl p-5 hover:border-slate-600/60 hover:bg-[#0e1f35]/80 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-300 leading-snug">{project.title}</p>
          {project.category && (
            <p className="text-xs text-slate-600 mt-0.5">{project.category}</p>
          )}
        </div>
        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${s.badge}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-600">Progress</span>
          <span className="text-xs text-slate-500 tabular-nums">{project.progress}%</span>
        </div>
        <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              project.status === 'done'   ? 'bg-emerald-500/60' :
              project.status === 'paused' ? 'bg-amber-500/50' :
              'bg-blue-500/60'
            }`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      {daysLeft !== null && (
        <p className={`text-xs ${
          project.status === 'done' ? 'text-slate-700' :
          daysLeft < 0   ? 'text-red-500/60' :
          daysLeft <= 14 ? 'text-amber-500/70' :
          'text-slate-700'
        }`}>
          {project.status === 'done'
            ? `Completed · ${format(parseISO(project.target_date), 'MMM d, yyyy')}`
            : daysLeft < 0
            ? `${Math.abs(daysLeft)}d overdue`
            : daysLeft === 0
            ? 'Due today'
            : `${daysLeft}d remaining`}
        </p>
      )}
    </div>
  )
}

// ─── Projects Page ────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [filter, setFilter]     = useState('active')

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function handleSave(fields) {
    if (modal.project) {
      const { error } = await supabase.from('projects').update(fields).eq('id', modal.project.id)
      if (!error) setProjects(prev => prev.map(p => p.id === modal.project.id ? { ...p, ...fields } : p))
    } else {
      const { data, error } = await supabase.from('projects').insert(fields).select().single()
      if (!error && data) setProjects(prev => [data, ...prev])
      if (error) { alert('Error: ' + error.message); return }
    }
    setModal(null)
  }

  async function handleDelete() {
    await supabase.from('projects').delete().eq('id', modal.project.id)
    setProjects(prev => prev.filter(p => p.id !== modal.project.id))
    setModal(null)
  }

  const FILTERS = ['active', 'paused', 'done', 'all']
  const visible = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  const counts = {
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    done:   projects.filter(p => p.status === 'done').length,
    all:    projects.length,
  }

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-3">Planning</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-200">Projects & Goals</h1>
            <p className="text-slate-500 text-sm mt-2">Long term projects, goals, and broader initiatives.</p>
            <div className="mt-5 h-px w-12 bg-blue-700/60 rounded-full" />
          </div>
          <button
            onClick={() => setModal({ project: null })}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-slate-300 text-sm rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#080f1e]/60 border border-slate-800/60 rounded-lg p-1 w-fit mb-8">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                filter === f
                  ? 'bg-slate-800 text-slate-300 border border-slate-700/50'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {counts[f] > 0 && (
                <span className={`text-xs tabular-nums ${filter === f ? 'text-slate-500' : 'text-slate-700'}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-slate-600 text-sm text-center py-20">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#0c1a2e]/60 border border-slate-800/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-600 text-sm">
              {filter === 'all' ? 'No goals yet.' : `No ${filter} goals.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setModal({ project: null })}
                className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Add your first goal →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visible.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setModal({ project })}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ProjectModal
          project={modal.project}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
