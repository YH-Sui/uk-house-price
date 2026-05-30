import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { fetchRegions, fetchPrices, PricePoint } from './api/client'

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function fmtPrice(n: number): string {
  return '£' + Math.round(n).toLocaleString('en-GB')
}

export default function App() {
  const [regions, setRegions] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [chartData, setChartData] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRegions()
      .then(r => {
        setRegions(r)
        if (r.length > 0) setSelectedRegion(r[0])
      })
      .catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (!selectedRegion) return
    setLoading(true)
    setError(null)
    fetchPrices({ region: selectedRegion })
      .then(res => setChartData(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedRegion])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          UK House Prices
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Monthly average prices · ONS / Land Registry · 1995–present
        </p>
      </header>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-gray-400 font-medium">Region</label>
        <select
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        {error && (
          <div className="text-red-400 text-sm mb-4">Error: {error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-72 text-gray-500 text-sm">
            Loading…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
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
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                }}
                formatter={(value: number) => [fmtPrice(value), 'Avg Price']}
                labelFormatter={fmtDate}
              />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="average_price"
                name="Average Price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}