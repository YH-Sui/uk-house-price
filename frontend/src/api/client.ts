// Base URL: empty string means "same origin" — Vite's dev proxy forwards /api/* to localhost:8000
const BASE = import.meta.env.VITE_API_URL ?? ''

export interface PricePoint {
  date: string
  average_price: number | null
  detached_price: number | null
  semi_detached_price: number | null
  terraced_price: number | null
  flat_price: number | null
  region: string
  property_type: string | null
}

export interface PricesResponse {
  data: PricePoint[]
  count: number
}

export async function fetchRegions(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/v1/regions/`)
  if (!res.ok) throw new Error(`Regions fetch failed: ${res.status}`)
  const data = await res.json()
  return data.regions
}

export async function fetchPrices(params: {
  region?: string
  date_from?: string
  date_to?: string
}): Promise<PricesResponse> {
  const url = new URL(`${BASE}/api/v1/prices/`, window.location.origin)
  if (params.region)    url.searchParams.set('region', params.region)
  if (params.date_from) url.searchParams.set('date_from', params.date_from)
  if (params.date_to)   url.searchParams.set('date_to', params.date_to)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Prices fetch failed: ${res.status}`)
  return res.json()
}