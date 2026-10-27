import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { SagaMap } from '../features/sagas/SagaMap'
import { errorText, formatMetric, isLogPoseLocked, paletteVars, sagaTransitionName } from '../features/sagas/format'
import { useSagaStory } from '../features/sagas/hooks'
import type { SagaSummary } from '../features/sagas/types'
import { useActiveStage } from '../features/sagas/useActiveStage'
import { useReducedMotion } from '../features/sagas/useReducedMotion'
import { useScrollProgress } from '../features/sagas/useScrollProgress'
import { useViewTransitionNavigate } from '../features/sagas/useViewTransitionNavigate'
import '../features/sagas/saga.css'

const buttonClass =
  'inline-flex h-9 items-center rounded-md border border-current px-3 text-sm font-medium opacity-90 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2'

/** CP5 · La saga como scrollytelling, basada solo en GET /sagas/{id}/story. */
export default function SagaStoryPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const preview = (location.state as { saga?: SagaSummary } | null)?.saga
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, error, loading, retry } = useSagaStory(id)
  const stages = useMemo(() => (data ? [...data.stages].sort((a, b) => a.order - b.order) : []), [data])

  const { activeIndex, registerStage, scrollToStage, nodesRef } = useActiveStage(stages.length, 0)
  const trackRef = useRef<HTMLElement>(null)
  const progress = useScrollProgress(trackRef, stages.length > 0)
  const reducedMotion = useReducedMotion()
  const navigateWithTransition = useViewTransitionNavigate()

  // 1) Abrir la URL con ?stage=<slug> lleva directo a esa etapa (una vez, al cargar la historia).
  const storyKey = data?.saga.id ?? null
  useLayoutEffect(() => {
    if (storyKey === null) return
    const index = stages.findIndex((stage) => stage.slug === searchParams.get('stage'))
    if (index > 0) scrollToStage(index, false)
    else window.scrollTo(0, 0)
    // Solo al cargar la historia: después manda el scroll.
  }, [storyKey])

  // 2) La URL siempre indica la etapa activa (replace: no llena el historial al hacer scroll).
  const activeSlug = stages[activeIndex]?.slug
  useEffect(() => {
    if (!activeSlug || searchParams.get('stage') === activeSlug) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('stage', activeSlug)
        return next
      },
      { replace: true },
    )
  }, [activeSlug, searchParams, setSearchParams])

  // 3) Teclado: Tab llega a cada etapa; flechas, PageUp/PageDown, Home y End saltan entre etapas.
  const goTo = useCallback(
    (index: number) => {
      const node = nodesRef.current[index]
      if (!node) return
      node.focus({ preventScroll: true })
      scrollToStage(index, !reducedMotion)
    },
    [nodesRef, scrollToStage, reducedMotion],
  )

  const onStageKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    const last = stages.length - 1
    let target: number | null = null
    if (event.key === 'ArrowDown' || event.key === 'PageDown') target = Math.min(last, index + 1)
    else if (event.key === 'ArrowUp' || event.key === 'PageUp') target = Math.max(0, index - 1)
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = last
    if (target === null) return
    event.preventDefault()
    goTo(target)
  }

  const activeStage = stages[activeIndex] ?? stages[0]
  const palette = activeStage?.palette ?? data?.saga.palette ?? preview?.palette
  const title = data?.saga.title ?? preview?.title ?? 'Saga'
  const percent = Math.round(progress * 100)

  return (
    <main ref={trackRef} className="saga-track min-h-screen" style={palette ? paletteVars(palette) : undefined}>
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-4">
        <header className="mb-4">
          <button type="button" className={buttonClass} onClick={() => navigateWithTransition('/sagas')}>
            ← Volver a las sagas
          </button>
          <div
            className="saga-vt mt-3 rounded-xl p-5"
            style={{ '--vt-name': sagaTransitionName(id), background: 'var(--saga-surface)' } as CSSProperties}
          >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Poneglyph</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {data && <p className="mt-2 max-w-3xl text-sm opacity-90">{data.saga.intro}</p>}
          </div>
        </header>

        {loading && <p aria-busy="true" className="py-16 text-center opacity-80">Descifrando el Poneglyph…</p>}

        {!loading && error !== null && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-xl p-6" style={{ background: 'var(--saga-surface)' }}>
            <p className="font-medium">{isLogPoseLocked(error) ? '🔒 Grand Line bloqueado' : 'No pudimos cargar esta saga'}</p>
            <p className="text-sm opacity-90">{errorText(error)}</p>
            <button type="button" className={buttonClass} onClick={retry}>
              {isLogPoseLocked(error) ? 'Volver a comprobar' : 'Reintentar'}
            </button>
          </div>
        )}

        {data && activeStage && (
          <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
            {/* Panel persistente: progreso + mapa + métricas de la etapa ACTIVA. */}
            <aside className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 px-4 pb-3 pt-2 lg:top-4 lg:mx-0 lg:h-fit lg:px-0" style={{ background: 'var(--saga-bg)' }}>
              <div>
                <div className="flex justify-between text-xs opacity-90">
                  <span>
                    Etapa <strong>{activeIndex + 1}</strong> de {stages.length} · {activeStage.island.name}
                  </span>
                  <span>Recorrido {percent}%</span>
                </div>
                <div
                  className="mt-1 h-1.5 overflow-hidden rounded-full"
                  style={{ background: 'var(--saga-surface)' }}
                  role="progressbar"
                  aria-label="Progreso del recorrido"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <div className="saga-progress-bar" style={{ '--progress': String(progress) } as CSSProperties} />
                </div>
              </div>

              <SagaMap map={data.map} stages={stages} activeIndex={activeIndex} />

              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
                {activeStage.metrics.map((metric) => (
                  <div key={metric.key} className="rounded-lg p-2" style={{ background: 'var(--saga-surface)' }}>
                    <dt className="text-[11px] uppercase tracking-wide opacity-80">{metric.label}</dt>
                    <dd className="text-base font-bold tabular-nums">{formatMetric(metric)}</dd>
                  </div>
                ))}
              </dl>

              <ol className="flex gap-1" aria-label="Etapas de la saga">
                {stages.map((stage, index) => (
                  <li key={stage.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={index === activeIndex ? 'step' : undefined}
                      aria-label={`Ir a la etapa ${index + 1}: ${stage.title}`}
                      className="h-7 w-full rounded text-xs font-semibold"
                      style={
                        index === activeIndex
                          ? { background: 'var(--saga-accent)', color: 'var(--saga-bg)' }
                          : { background: 'var(--saga-surface)' }
                      }
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
              </ol>
            </aside>

            {/* Narrativa por etapas: todo el texto siempre está en el DOM (se lee sin animaciones). */}
            <ol className="flex flex-col" aria-label="Narrativa por etapas">
              {stages.map((stage, index) => (
                <li key={stage.id} className="flex min-h-[70vh] items-center">
                  <article
                    ref={registerStage(index)}
                    data-index={index}
                    tabIndex={0}
                    aria-current={index === activeIndex ? 'step' : undefined}
                    aria-labelledby={`stage-title-${stage.id}`}
                    onKeyDown={(event) => onStageKeyDown(event, index)}
                    onFocus={(event) => {
                      if (event.currentTarget.matches(':focus-visible')) scrollToStage(index, !reducedMotion)
                    }}
                    className="saga-stage w-full rounded-xl p-5 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ background: 'var(--saga-surface)' }}
                  >
                    <p className="text-xs uppercase tracking-widest opacity-80">
                      Etapa {index + 1} de {stages.length} · {stage.island.name}
                    </p>
                    <h2 id={`stage-title-${stage.id}`} className="mt-1 text-xl font-bold">
                      {stage.title}
                    </h2>
                    {stage.narrative.map((paragraph, i) => (
                      <p key={i} className="mt-3 leading-relaxed opacity-90">
                        {paragraph}
                      </p>
                    ))}
                  </article>
                </li>
              ))}
            </ol>
          </div>
        )}
        {data && <div className="h-[40vh]" aria-hidden="true" />}
      </div>
    </main>
  )
}
