import type { FruitType, PageSize, SortValue, WantedStatus } from './constants'

/** Un cartel tal como lo devuelve GET /wanted y GET /wanted/{id}. */
export interface WantedPoster {
  id: string
  name: string
  epithet: string
  bounty: number
  status: WantedStatus
  crew: { id: string; name: string } | null
  role: string
  devilFruit: { name: string; type: FruitType } | null
  threatLevel: number
  lastSeenIsland: string
  updatedAt: string
}

/** Respuesta paginada de GET /wanted (page empieza en 0). */
export interface WantedPage {
  content: WantedPoster[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

/** Lo que usa el filtro de GET /crews (la API trae más campos). */
export interface Crew {
  id: string
  name: string
}

export interface WantedQuery {
  page: number
  size: PageSize
  sort: SortValue
  status: string
  crewId: string
  fruit: string
  q: string
}
