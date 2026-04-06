import { useState, useEffect } from 'react'

// Fetched via Vite dev proxy → /yf → https://query1.finance.yahoo.com
// Only works with `npm run dev` (not static builds).

const STOCKS = [
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust',           short: 'S&P 500' },
  { ticker: 'VEU', name: 'Vanguard FTSE All-World ex-US ETF', short: 'Intl ex-US' },
  { ticker: 'VUG', name: 'Vanguard Growth ETF',               short: 'Growth' },
  { ticker: 'BND', name: 'Vanguard Total Bond Market ETF',    short: 'Bonds' },
  { ticker: 'VTV', name: 'Vanguard Value ETF',                short: 'Value' },
]

async function fetchTicker(ticker) {
  const res = await fetch(`/yf/v8/finance/chart/${ticker}?interval=1d&range=3mo`)
  if (!res.ok) throw new Error('fetch failed')
  const json = await res.json()
  const result = json.chart?.result?.[0]
  if (!result) throw new Error('no result')
  const closes = (result.indicators?.quote?.[0]?.close || []).filter(Boolean)
  return {
    price:     result.meta.regularMarketPrice,
    prevClose: result.meta.previousClose,
    closes,
    currency:  result.meta.currency || 'USD',
  }
}

function Sparkline({ prices, isUp }) {
  if (!prices || prices.length < 2) return null
  const W = 100, H = 32
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const points = prices
    .map((p, i) => `${(i / (prices.length - 1)) * W},${H - ((p - min) / range) * H}`)
    .join(' ')
  return (
    <svg width={W} height={H} className="overflow-visible flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#4ade80' : '#f87171'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function StocksPage() {
  const [data, setData]       = useState({})
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState(null)

  useEffect(() => {
    Promise.allSettled(
      STOCKS.map(async ({ ticker }) => {
        const result = await fetchTicker(ticker)
        return { ticker, result }
      })
    ).then(results => {
      const dataMap  = {}
      const errorMap = {}
      results.forEach((r, i) => {
        const { ticker } = STOCKS[i]
        if (r.status === 'fulfilled') dataMap[ticker]  = r.value.result
        else                          errorMap[ticker] = true
      })
      setData(dataMap)
      setErrors(errorMap)
      setUpdated(new Date())
      setLoading(false)
    })
  }, [])

  function refresh() {
    setLoading(true)
    setData({})
    setErrors({})
    Promise.allSettled(
      STOCKS.map(async ({ ticker }) => {
        const result = await fetchTicker(ticker)
        return { ticker, result }
      })
    ).then(results => {
      const dataMap  = {}
      const errorMap = {}
      results.forEach((r, i) => {
        const { ticker } = STOCKS[i]
        if (r.status === 'fulfilled') dataMap[ticker]  = r.value.result
        else                          errorMap[ticker] = true
      })
      setData(dataMap)
      setErrors(errorMap)
      setUpdated(new Date())
      setLoading(false)
    })
  }

  const totalValue = STOCKS.reduce((sum, { ticker }) => {
    const d = data[ticker]
    return d ? sum + d.price : sum
  }, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Portfolio</h1>
          {updated && (
            <p className="text-slate-600 text-xs mt-0.5">
              Updated {updated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors disabled:opacity-40"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-slate-600 text-sm text-center py-20">Fetching market data…</div>
      ) : (
        <div className="space-y-2">
          {STOCKS.map(({ ticker, name, short }) => {
            const d = data[ticker]
            const hasError = errors[ticker]

            if (hasError || !d) {
              return (
                <div key={ticker} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400">{ticker}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{name}</p>
                  </div>
                  <p className="text-xs text-red-500">Unavailable</p>
                </div>
              )
            }

            const change    = d.price - d.prevClose
            const changePct = (change / d.prevClose) * 100
            const isUp      = change >= 0
            const sparkPrices = d.closes.slice(-30)

            return (
              <div
                key={ticker}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 flex items-center gap-4 hover:border-slate-700 transition-colors"
              >
                {/* Ticker & name */}
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-100">{ticker}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{short}</p>
                </div>

                {/* Sparkline */}
                <div className="flex-1 hidden sm:flex items-center">
                  <Sparkline prices={sparkPrices} isUp={isUp} />
                </div>

                {/* Price & change */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-100 tabular-nums">
                    ${d.price.toFixed(2)}
                  </p>
                  <p className={`text-xs tabular-nums font-medium mt-0.5 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-700 mt-6 text-center">
        Market data via Yahoo Finance · Delayed · For personal use only
      </p>
    </div>
  )
}
