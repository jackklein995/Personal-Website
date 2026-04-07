import { useState, useRef } from 'react'

export default function TodoPage() {
  const [input, setInput] = useState('')
  const [items, setItems] = useState([])
  const inputRef = useRef(null)

  const addItem = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setItems(prev => [...prev, { id: Date.now(), text: trimmed, done: false }])
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addItem()
  }

  const toggleDone = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearAll = () => setItems([])

  const active = items.filter(i => !i.done)
  const done   = items.filter(i => i.done)

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Subtle background depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-blue-900/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-3">Quick List</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-200">
            To Do
          </h1>
          <div className="mt-5 h-px w-12 bg-blue-700/60 rounded-full" />
        </div>

        {/* Input row */}
        <div className="flex gap-2 mb-8">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task and press Enter..."
            className="flex-1 bg-[#0c1a2e]/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-700/50 transition-all"
          />
          <button
            onClick={addItem}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-200 transition-all duration-150 flex-shrink-0"
          >
            Add
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#0c1a2e]/60 border border-slate-800/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-600 text-sm">No tasks yet. Type something above.</p>
          </div>
        )}

        {/* Active tasks */}
        {active.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-widest">
                Tasks <span className="text-slate-500 ml-1">{active.length}</span>
              </p>
              <button
                onClick={clearAll}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            <ul className="space-y-1.5">
              {active.map(item => (
                <li
                  key={item.id}
                  className="group flex items-center gap-3 bg-[#0c1a2e]/70 border border-slate-700/40 rounded-xl px-4 py-3 hover:border-slate-600/50 transition-all"
                >
                  <button
                    onClick={() => toggleDone(item.id)}
                    className="w-4 h-4 rounded-full border border-slate-700 hover:border-slate-500 flex-shrink-0 transition-colors"
                    aria-label="Mark done"
                  />
                  <span className="flex-1 text-sm text-slate-400">{item.text}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-slate-400 transition-all flex-shrink-0"
                    aria-label="Remove"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Done tasks */}
        {done.length > 0 && (
          <div>
            <p className="text-xs text-slate-700 font-medium uppercase tracking-widest mb-3">
              Done <span className="ml-1">{done.length}</span>
            </p>
            <ul className="space-y-1.5">
              {done.map(item => (
                <li
                  key={item.id}
                  className="group flex items-center gap-3 bg-[#090e1b]/50 border border-slate-800/40 rounded-xl px-4 py-3 transition-all"
                >
                  <button
                    onClick={() => toggleDone(item.id)}
                    className="w-4 h-4 rounded-full border border-slate-700/50 bg-slate-800/40 flex items-center justify-center flex-shrink-0 transition-colors"
                    aria-label="Mark undone"
                  >
                    <svg className="w-2.5 h-2.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <span className="flex-1 text-sm text-slate-600 line-through">{item.text}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-slate-500 transition-all flex-shrink-0"
                    aria-label="Remove"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
