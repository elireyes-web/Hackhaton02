export const PAGE_SIZES = [10, 20, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]
export const DEFAULT_SIZE: PageSize = 20

export const SORT_OPTIONS = [
  { value: 'bounty,desc', label: 'Mayor recompensa' },
  { value: 'name,asc', label: 'Nombre (A-Z)' },
  { value: 'updatedAt,desc', label: 'Actualizados recientemente' },
] as const
export type SortValue = (typeof SORT_OPTIONS)[number]['value']
export const DEFAULT_SORT: SortValue = 'bounty,desc'

export interface Option {
  value: string
  label: string
}

// TODO: REEMPLAZAR con los valores reales del enum que aparecen en Swagger (GET /wanted).
// Si un valor de la URL no está en esta lista, se ignora (así una URL inválida no rompe la vista).
export const STATUS_OPTIONS: readonly Option[] = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'CAPTURED', label: 'Capturado' },
  { value: 'DECEASED', label: 'Fallecido' },
]

// TODO: REEMPLAZAR con los valores reales del enum de fruta del diablo de Swagger.
export const FRUIT_OPTIONS: readonly Option[] = [
  { value: 'PARAMECIA', label: 'Paramecia' },
  { value: 'ZOAN', label: 'Zoan' },
  { value: 'LOGIA', label: 'Logia' },
]
