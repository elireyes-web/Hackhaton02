import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { crewNameOf, formatBounty, humanizeKey, statusLabel } from '../features/wanted/format'
import { useWantedDetail } from '../features/wanted/hooks'

const actionClass =
  'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-700'

function displayValue(key: string, value: string | number | boolean): string {
  if (key === 'bounty' && typeof value === 'number') return formatBounty(value)
  if (key === 'status' && typeof value === 'string') return statusLabel(value)
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return String(value)
}

export default function WantedDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, error, loading, retry } = useWantedDetail(id)

  // Volver con "atrás" restaura el listado exactamente como estaba (el estado vive en la URL).
  // Si abrieron el detalle directo (sin historial previo), vamos al listado.
  const goBack = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate('/wanted')
  }

  const facts =
    data === null
      ? []
      : Object.entries(data).filter(
          (entry): entry is [string, string | number | boolean] =>
            ['string', 'number', 'boolean'].includes(typeof entry[1]) && entry[1] !== '' && entry[0] !== 'id',
        )

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <div>
        <button type="button" className={actionClass} onClick={goBack}>
          Volver a los carteles
        </button>
      </div>

      {loading && (
        <div aria-busy="true" className="flex flex-col gap-3">
          <div className="h-8 w-2/3 rounded bg-slate-100 motion-safe:animate-pulse" />
          <div className="h-5 w-1/3 rounded bg-slate-100 motion-safe:animate-pulse" />
          <div className="h-48 rounded bg-slate-100 motion-safe:animate-pulse" />
        </div>
      )}

      {!loading && error !== null && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-md border border-slate-200 bg-white p-6">
          <p className="font-medium text-slate-900">No pudimos cargar este cartel</p>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="flex gap-2">
            <button type="button" className={actionClass} onClick={retry}>
              Reintentar
            </button>
            <button type="button" className={actionClass} onClick={() => navigate('/wanted')}>
              Ver todos los carteles
            </button>
          </div>
        </div>
      )}

      {!loading && data !== null && (
        <article className="rounded-md border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
          {data.epithet && <p className="text-slate-600">{data.epithet}</p>}
          <p className="mt-3 text-3xl font-bold text-amber-800">{formatBounty(data.bounty)}</p>
          <p className="text-sm text-slate-600">
            {[statusLabel(data.status), crewNameOf(data)].filter(Boolean).join(' · ')}
          </p>

          {facts.length > 0 && (
            <dl className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {facts
                .filter(([key]) => !['name', 'epithet', 'bounty', 'status', 'crewName'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-slate-600">{humanizeKey(key)}</dt>
                    <dd className="font-medium text-slate-900">{displayValue(key, value)}</dd>
                  </div>
                ))}
            </dl>
          )}
        </article>
      )}
    </main>
  )
}
