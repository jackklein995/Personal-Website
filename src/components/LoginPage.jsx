import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // on success, App.jsx re-renders with the session — no redirect needed
  }

  return (
    <div className="min-h-screen bg-[#070d1f] flex items-center justify-center px-4">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-200 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#0c1a2e]/70 border border-slate-700/40 rounded-2xl px-6 py-7">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#080f1e] border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400/80 bg-red-900/10 border border-red-800/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 bg-blue-700/70 hover:bg-blue-600/70 disabled:opacity-40 border border-blue-600/30 text-slate-200 text-sm font-medium rounded-lg transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
