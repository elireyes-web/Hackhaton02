// Usa el cliente del CP1 (src/lib/api.ts): agrega VITE_API_BASE_URL + el Bearer token,
// acepta { signal } para cancelar y lanza ApiError si la respuesta no es 2xx.
import { apiFetch } from '../../lib/api'
import type { Crew, WantedPage, WantedPoster } from './types'

export function fetchWanted(queryString: string, signal: AbortSignal): Promise<WantedPage> {
  return apiFetch<WantedPage>(`/wanted?${queryString}`, { signal })
}

export function fetchWantedById(id: string, signal: AbortSignal): Promise<WantedPoster> {
  return apiFetch<WantedPoster>(`/wanted/${encodeURIComponent(id)}`, { signal })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeCrews(raw: unknown): Crew[] {
  let list: unknown[] = []
  if (Array.isArray(raw)) list = raw
  else if (isRecord(raw) && Array.isArray(raw.content)) list = raw.content
  else if (isRecord(raw) && Array.isArray(raw.items)) list = raw.items

  return list.flatMap((item): Crew[] => {
    if (!isRecord(item)) return []
    const { id, name } = item
    if ((typeof id === 'string' || typeof id === 'number') && typeof name === 'string') {
      return [{ id: String(id), name }]
    }
    return []
  })
}

export async function fetchCrews(signal: AbortSignal): Promise<Crew[]> {
  const raw = await apiFetch<unknown>('/crews', { signal })
  return normalizeCrews(raw)
}
