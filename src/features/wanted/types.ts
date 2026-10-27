import type { PageSize, SortValue } from './constants'

export interface WantedPoster {
  id: string | number
  name: string
  epithet?: string | null
  bounty?: number | null
  status?: string | null
  crewName?: string | null
  [key: string]: unknown
}

export interface WantedPage {
  content: WantedPoster[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

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
