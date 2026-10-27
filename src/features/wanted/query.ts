import {
  DEFAULT_SIZE,
  DEFAULT_SORT,
  FRUIT_OPTIONS,
  PAGE_SIZES,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type Option,
  type PageSize,
  type SortValue,
} from './constants'
import type { WantedQuery } from './types'

const ID_PATTERN = /^[\w-]{1,64}$/

function parsePage(raw: string | null): number {
  return raw !== null && /^\d{1,6}$/.test(raw) ? Number(raw) : 0
}

function parseSize(raw: string | null): PageSize {
  const n = Number(raw)
  return PAGE_SIZES.find((s) => s === n) ?? DEFAULT_SIZE
}

function parseSort(raw: string | null): SortValue {
  return SORT_OPTIONS.find((o) => o.value === raw)?.value ?? DEFAULT_SORT
}

function parseOption(raw: string | null, options: readonly Option[]): string {
  return options.find((o) => o.value === raw)?.value ?? ''
}

function parseId(raw: string | null): string {
  return raw !== null && ID_PATTERN.test(raw) ? raw : ''
}

function parseText(raw: string | null): string {
  return (raw ?? '').trim().slice(0, 100)
}

/** Lee la URL y devuelve siempre un estado válido, sin importar qué venga en ella. */
export function parseWantedQuery(sp: URLSearchParams): WantedQuery {
  return {
    page: parsePage(sp.get('page')),
    size: parseSize(sp.get('size')),
    sort: parseSort(sp.get('sort')),
    status: parseOption(sp.get('status'), STATUS_OPTIONS),
    crewId: parseId(sp.get('crewId')),
    fruit: parseOption(sp.get('fruit'), FRUIT_OPTIONS),
    q: parseText(sp.get('q')),
  }
}

/** URL canónica: omite los valores por defecto. */
export function toSearchParams(query: WantedQuery): URLSearchParams {
  const sp = new URLSearchParams()
  if (query.page > 0) sp.set('page', String(query.page))
  if (query.size !== DEFAULT_SIZE) sp.set('size', String(query.size))
  if (query.sort !== DEFAULT_SORT) sp.set('sort', query.sort)
  if (query.status) sp.set('status', query.status)
  if (query.crewId) sp.set('crewId', query.crewId)
  if (query.fruit) sp.set('fruit', query.fruit)
  if (query.q) sp.set('q', query.q)
  return sp
}

/** Query string para el backend (siempre explícita). */
export function toApiQueryString(query: WantedQuery): string {
  const sp = new URLSearchParams()
  sp.set('page', String(query.page))
  sp.set('size', String(query.size))
  sp.set('sort', query.sort)
  if (query.status) sp.set('status', query.status)
  if (query.crewId) sp.set('crewId', query.crewId)
  if (query.fruit) sp.set('fruit', query.fruit)
  if (query.q) sp.set('q', query.q)
  return sp.toString()
}
