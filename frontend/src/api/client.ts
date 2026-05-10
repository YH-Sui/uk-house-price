const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export type PropertyType = 'flat' | 'terraced' | 'semi_detached' | 'detached' | 'all'

export interface PricePoint {
  date: string
  average_price: number
  volume?: number
}

export interface PriceSeriesResponse {
  region: string
  property_type: PropertyType
  series: PricePoint[]
}

export interface PricesParams {
  region: string
  property_type?: PropertyType
  date_from?: string
  date_to?: string
  indexed?: boolean
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json()
}

export const api = {
  getPrices: (params: PricesParams) =>
    apiFetch<PriceSeriesResponse>('/api/v1/prices/', {
      region: params.region,
      property_type: params.property_type ?? 'all',
      ...(params.date_from && { date_from: params.date_from }),
      ...(params.date_to && { date_to: params.date_to }),
      ...(params.indexed !== undefined && { indexed: String(params.indexed) }),
    }),

  getRegions: () =>
    apiFetch<{ regions: string[] }>('/api/v1/regions/'),

  getLondonBoroughs: () =>
    apiFetch<{ boroughs: string[] }>('/api/v1/regions/london/boroughs'),
}
