import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { fetchRegions, fetchPrices, PricePoint } from './api/client'

// ── Series config ────────────────────────────────────────────────────────────
const SERIES = [
  { key: 'average_price',       label: 'Average',       color: '#3b82f6' },
  { key: 'detached_price',      label: 'Detached',      color: '#10b981' },
  { key: 'semi_detached_price', label: 'Semi-detached', color: '#f59e0b' },
  { key: 'terraced_price',      label: 'Terraced',      color: '#ef4444' },
  { key: 'flat_price',          label: 'Flat',          color: '#a855f7' },
] as const

type SeriesKey = typeof SERIES[number]['key']

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function fmtPrice(n: number): string {
  return '£' + Math.round(n).toLocaleString('en-GB')
}

// ── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [regions, setRegions]               = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [chartData, setChartData]           = useState<PricePoint[]>([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  // Which series are visible — default: all on
  const [activeSeries, setActiveSeries] = useState<Set<SeriesKey>>(
    new Set(SERIES.map(s => s.key))
  )

  // Date range — stored as year strings for the inputs, converted on fetch
  const [yearFrom, setYearFrom] = useState<string>('1995')
  const [yearTo,   setYearTo]   = useState<string>(String(new Date().getFullYear()))

  // Load regions once on mount
  useEffect(() => {
    fetchRegions()
      .then(r => {
        setRegions(r)
        if (r.length > 0) setSelectedRegion(r[0])
      })
      .catch(e => setError(e.message))
  }, [])

  // Re-fetch whenever region or date range changes
  useEffect(() => {
    if (!selectedRegion) return
    setLoading(true)
    setError(null)
    fetchPrices({
      region:    selectedRegion,
      date_from: `${yearFrom}-01-01`,
      date_to:   `${yearTo}-12-31`,
    })
      .then(res => setChartData(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedRegion, yearFrom, yearTo])

  function toggleSeries(key: SeriesKey) {
    setActiveSeries(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev  // don't allow deselecting the last one
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function handleYearFrom(val: string) {
    if (/^\d{0,4}$/.test(val)) setYearFrom(val)
  }
  function handleYearTo(val: string) {
    if (/^\d{0,4}$/.test(val)) setYearTo(val)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          UK House Prices
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Monthly average prices · ONS / Land Registry · 1995–present
        </p>
      </header>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-end gap-6">

        {/* Region selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Region
          </label>
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Date range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={yearFrom}
              onChange={e => handleYearFrom(e.target.value)}
              min={1995}
              max={2100}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              placeholder="From"
            />
            <span className="text-gray-500 text-sm">–</span>
            <input
              type="number"
              value={yearTo}
              onChange={e => handleYearTo(e.target.value)}
              min={1995}
              max={2100}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              placeholder="To"
            />
          </div>
        </div>

        {/* Property type toggles */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Property type
          </label>
          <div className="flex flex-wrap gap-2">
            {SERIES.map(s => {
              const active = activeSeries.has(s.key)
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition-all
                    ${active
                      ? 'text-white border-transparent'
                      : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
                    }`}
                  style={active ? { backgroundColor: s.color, borderColor: s.color } : {}}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        {error && (
          <div className="text-red-400 text-sm mb-4">Error: {error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-72 text-gray-500 text-sm">
            Loading…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                interval={23}
              />
              <YAxis
                tickFormatter={fmtPrice}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                }}
                formatter={(value: number, name: string) => [fmtPrice(value), name]}
                labelFormatter={fmtDate}
              />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />

              {SERIES.filter(s => activeSeries.has(s.key)).map(s => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}