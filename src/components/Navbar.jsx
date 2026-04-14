import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const links = [
  { to: '/',         label: 'Home'     },
  { to: '/board',    label: 'Board'    },
  { to: '/backlog',  label: 'Backlog'  },
  { to: '/calendar', label: 'Calendar' },
  { to: '/sports',   label: 'Sports'   },
  { to: '/projects', label: 'Projects' },
]

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const active = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080f1e]/90 border-b border-slate-800/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14">
          <div className="hidden sm:flex items-center gap-0.5">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active(to)
                    ? 'bg-slate-800/70 text-slate-200 border border-slate-700/50'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <button
            className="sm:hidden text-slate-500 hover:text-slate-300 p-1.5"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-[#080f1e]/90 border-t border-slate-800/60 px-3 pb-3 space-y-0.5">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active(to)
                  ? 'bg-slate-800/70 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
