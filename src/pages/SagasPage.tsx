import type { CSSProperties, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { errorText, formatNumber, isLogPoseLocked, sagaTransitionName } from '../features/sagas/format'
import { useSagas } from '../features/sagas/hooks'
import type { SagaSummary } from '../features/sagas/types'
import { useViewTransitionNavigate } from '../features/sagas/useViewTransitionNavigate'
import '../features/sagas/saga.css'

const actionClass =
  'inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-700'

/** Resumen de las sagas. Abrir una usa View Transition API (con fallback a navegación normal). */
export default function SagasPage() {
  const { data, error, loading, retry } = useSagas()
  const navigateWithTransition = useViewTransitionNavigate()
  const sagas = data ? [...data].sort((a, b) => a.order - b.order) : []

  function openSaga(event: MouseEvent<HTMLAnchorElement>, saga: SagaSummary) {
    // Ctrl/Cmd + clic o clic del medio: comportamiento normal del enlace (nueva pestaña).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    navigateWithTransition(`/sagas/${encodeURIComponent(saga.id)}`, { state: { saga } })
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Poneglyph: la Gran Saga</h1>
          <p className="text-sm text-slate-600">Elige una saga para recorrer su historia por el Grand Line.</p>
        </div>
        <Link to="/dashboard" className={actionClass}>
          ← Volver al dashboard
        </Link>
      </header>

      {loading && (
        <ul aria-busy="true" className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <li key={i} className="h-64 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
          ))}
        </ul>
      )}

      {!loading && error !== null && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-md border border-slate-200 bg-white p-6">
          <p className="font-medium text-slate-900">{isLogPoseLocked(error) ? '🔒 Grand Line bloqueado' : 'No pudimos cargar las sagas'}</p>
          <p className="text-sm text-slate-600">{errorText(error)}</p>
          <button type="button" className={actionClass} onClick={retry}>
            {isLogPoseLocked(error) ? 'Volver a comprobar' : 'Reintentar'}
          </button>
        </div>
      )}

      {!loading && data !== null && sagas.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-600">No hay sagas disponibles.</p>
      )}

      {sagas.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {sagas.map((saga) => (
            <li key={saga.id}>
              <a
                href={`/sagas/${encodeURIComponent(saga.id)}`}
                onClick={(event) => openSaga(event, saga)}
                className="block overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
              >
                <div
                  className="saga-vt flex h-28 items-end p-4"
                  style={
                    {
                      '--vt-name': sagaTransitionName(saga.id),
                      background: `linear-gradient(135deg, ${saga.palette.background}, ${saga.palette.primary})`,
                      color: saga.palette.text,
                    } as CSSProperties
                  }
                >
                  <span className="text-xs font-semibold uppercase tracking-widest">Saga {saga.order}</span>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <h2 className="text-lg font-bold text-slate-900">{saga.title}</h2>
                  <p className="text-sm italic text-slate-600">{saga.subtitle}</p>
                  <p className="text-sm text-slate-700">{saga.synopsis}</p>
                  <p className="text-xs text-slate-500">
                    {saga.stageCount} etapas · {formatNumber(saga.totalDistanceNm)} mn · {saga.firstIsland} → {saga.lastIsland}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
