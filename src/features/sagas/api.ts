// Usa el cliente del CP1 (src/lib/api.ts): VITE_API_BASE_URL + Bearer token + ApiError.
import { apiFetch } from '../../lib/api'
import type { SagaStory, SagaSummary } from './types'

export function fetchSagas(signal: AbortSignal): Promise<SagaSummary[]> {
  return apiFetch<SagaSummary[]>('/sagas', { signal })
}

export function fetchSagaStory(id: string, signal: AbortSignal): Promise<SagaStory> {
  return apiFetch<SagaStory>(`/sagas/${encodeURIComponent(id)}/story`, { signal })
}
