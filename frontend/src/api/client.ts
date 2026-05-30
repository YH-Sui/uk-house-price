const BASE = import.meta.env.VITE_API_URL ?? ''

export interface PricePoint {
  date: string
  average_price: number
  region: string
  property_type: string
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
  property_type?: string
  start_date?: string
  end_date?: string
}): Promise<PricesResponse> {
  const url = new URL(`${BASE}/api/v1/prices/`, window.location.origin)
  if (params.region)        url.searchParams.set('region', params.region)
  if (params.property_type) url.searchParams.set('property_type', params.property_type)
  if (params.start_date)    url.searchParams.set('start_date', params.start_date)
  if (params.end_date)      url.searchParams.set('end_date', params.end_date)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Prices fetch failed: ${res.status}`)
  return res.json()
}