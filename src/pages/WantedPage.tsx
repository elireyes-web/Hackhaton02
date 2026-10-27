import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FRUIT_OPTIONS, PAGE_SIZES, SORT_OPTIONS, STATUS_OPTIONS, type Option } from '../features/wanted/constants'
import { crewNameOf, formatBounty, statusLabel } from '../features/wanted/format'
import { useCrews, useWantedList } from '../features/wanted/hooks'
import { Pagination } from '../features/wanted/Pagination'
import { parseWantedQuery, toApiQueryString, toSearchParams } from '../features/wanted/query'
import { SearchInput } from '../features/wanted/SearchInput'
import type { WantedQuery } from '../features/wanted/types'

const selectClass =
  'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-700'
const actionClass =
  'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-700'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  )
}

function OptionSelect({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string
  value: string
  options: readonly Option[]
  allLabel: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label}>
      <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export default function WantedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = parseWantedQuery(searchParams)
  const { data, error, loading, retry } = useWantedList(toApiQueryString(query))
  const crews = useCrews()
  const [searchKey, setSearchKey] = useState(0)

  // Todo cambio de filtro/orden/tamaño/búsqueda vuelve a la página 0; solo el paginador conserva `page`.
  const update = useCallback(
    (patch: Partial<WantedQuery>, replace = false) => {
      setSearchParams(
        (prev) => {
          const next: WantedQuery = { ...parseWantedQuery(prev), ...patch }
          if (!('page' in patch)) next.page = 0
          return toSearchParams(next)
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  const commitSearch = useCallback((q: string) => update({ q }), [update])

  // Nunca dejar al usuario en una página que ya no existe.
  useEffect(() => {
    if (data === null) return
    const lastPage = Math.max(data.totalPages - 1, 0)
    if (query.page > lastPage) update({ page: lastPage }, true)
  }, [data, query.page, update])

  const hasFilters = Boolean(query.status || query.crewId || query.fruit || query.q)
  const clearFilters = () => {
    setSearchKey((k) => k + 1)
    update({ status: '', crewId: '', fruit: '', q: '' })
  }

  const crewOptions: Option[] = crews.map((c) => ({ value: c.id, label: c.name }))
  if (query.crewId && !crewOptions.some((o) => o.value === query.crewId)) {
    crewOptions.push({ value: query.crewId, label: `Tripulación ${query.crewId}` })
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Carteles de "Se Busca"</h1>
        <p className="text-sm text-slate-600">Filtra, ordena y abre el cartel de cualquier pirata.</p>
      </header>

      <section aria-label="Filtros" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Buscar">
          <SearchInput key={searchKey} value={query.q} onCommit={commitSearch} />
        </Field>
        <OptionSelect label="Estado" value={query.status} options={STATUS_OPTIONS} allLabel="Todos" onChange={(status) => update({ status })} />
        <OptionSelect label="Tripulación" value={query.crewId} options={crewOptions} allLabel="Todas" onChange={(crewId) => update({ crewId })} />
        <OptionSelect label="Fruta del diablo" value={query.fruit} options={FRUIT_OPTIONS} allLabel="Todas" onChange={(fruit) => update({ fruit })} />
        <Field label="Ordenar por">
          <select
            className={selectClass}
            value={query.sort}
            onChange={(e) => {
              const sort = SORT_OPTIONS.find((o) => o.value === e.target.value)
              if (sort) update({ sort: sort.value })
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Carteles por página">
          <select
            className={selectClass}
            value={query.size}
            onChange={(e) => {
              const size = PAGE_SIZES.find((s) => s === Number(e.target.value))
              if (size) update({ size })
            }}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <div className="flex h-9 items-center justify-between">
        <p className="text-sm text-slate-600" aria-live="polite">
          {loading ? 'Buscando carteles…' : data ? `${data.totalElements} carteles` : ''}
        </p>
        {hasFilters && (
          <button type="button" className={actionClass} onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Alto mínimo fijo (10 filas) para que loading, error y vacío no muevan el layout. */}
      <section aria-label="Resultados" aria-busy={loading} className="min-h-[40rem] rounded-md border border-slate-200 bg-white">
        {loading && (
          <ul>
            {Array.from({ length: query.size }, (_, i) => (
              <li key={i} className="h-16 border-b border-slate-100 p-3 last:border-b-0">
                <div className="h-full rounded bg-slate-100 motion-safe:animate-pulse" />
              </li>
            ))}
          </ul>
        )}

        {!loading && error !== null && (
          <div role="alert" className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-medium text-slate-900">No pudimos cargar los carteles</p>
            <p className="text-sm text-slate-600">{error}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" className={actionClass} onClick={retry}>
                Reintentar
              </button>
              {query.page > 0 && (
                <button type="button" className={actionClass} onClick={() => update({ page: 0 }, true)}>
                  Ir a la primera página
                </button>
              )}
              {hasFilters && (
                <button type="button" className={actionClass} onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && data !== null && data.content.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-medium text-slate-900">Ningún cartel coincide con tu búsqueda</p>
            <p className="text-sm text-slate-600">Prueba con otros filtros o con otro nombre.</p>
            {hasFilters && (
              <button type="button" className={actionClass} onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!loading && data !== null && data.content.length > 0 && (
          <ul>
            {data.content.map((poster) => {
              const crew = crewNameOf(poster)
              return (
                <li key={String(poster.id)} className="border-b border-slate-100 last:border-b-0">
                  <Link
                    to={`/wanted/${encodeURIComponent(String(poster.id))}`}
                    className="flex h-16 items-center justify-between gap-4 px-4 hover:bg-amber-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-700"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-900">{poster.name}</span>
                      <span className="block truncate text-sm text-slate-600">
                        {[poster.epithet, crew].filter(Boolean).join(' · ') || 'Sin epíteto'}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-semibold text-amber-800">{formatBounty(poster.bounty)}</span>
                      <span className="block text-xs text-slate-600">{statusLabel(poster.status)}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Pagination
        page={query.page}
        totalPages={data?.totalPages ?? 0}
        loading={loading}
        onChange={(page) => update({ page })}
      />
    </main>
  )
}
