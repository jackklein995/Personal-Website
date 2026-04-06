import { useState } from 'react'
import F1Section from './F1Section'
import MLBSection from './MLBSection'

const TABS = [
  { id: 'f1',  label: 'Formula 1' },
  { id: 'mlb', label: 'MLB'       },
]

export default function SportsPage() {
  const [tab, setTab] = useState('f1')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Sports</h1>

      <div className="flex gap-1 bg-gray-100 border border-gray-200 rounded-lg p-1 w-fit mb-8">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'f1'  && <F1Section />}
      {tab === 'mlb' && <MLBSection />}
    </div>
  )
}
