# Log Pose Console — Hackathon Frontend One Piece

Consola en React + TypeScript para la Guild de Cazarrecompensas: carteles de "Se Busca", noticias
del mundo y la Gran Saga del Grand Line. El enunciado completo está en [`ENUNCIADO.md`](./ENUNCIADO.md).

## Integrantes

| Nombre | Código |
|:--|:--|
| Marco Sebastián Ruiz Camarena | 202520102 |
| Eli Bernie Reyes Juarez | 202520084 |
| Gabriel Saavedra | _pendiente_ |

Tripulación: **H250** · Código de equipo: **TEAM-001**

## Cómo ejecutar

Requisitos: Node 24 LTS y npm.

```bash
npm install
cp .env.example .env      # en Windows (CMD): copy .env.example .env
npm run dev               # http://localhost:5173
```

Build de producción:

```bash
npm run build
npm run preview
```

### Variables de entorno

| Variable | Valor |
|:--|:--|
| `VITE_API_BASE_URL` | `https://logpose-api-jg7f.onrender.com/api/v1` |

La URL se lee desde `.env` (no está escrita en el código). El `.env` no se sube al repositorio.

## Stack

React 18+ · TypeScript estricto · Vite · React Router · Tailwind CSS · Fetch API.
Sin librerías de UI, caché de servidor, estado en URL, infinite scroll ni animación.

## Estructura

```
src/
├── App.tsx               Rutas y providers
├── lib/api.ts            Cliente HTTP: base URL, token Bearer, errores (ApiError), 401 → login
├── auth/                 Sesión (AuthContext) y guardia de rutas privadas (RequireAuth)
├── routes/               Login, Registro, Dashboard, 404
├── features/
│   ├── wanted/           CP2: tipos, API, URL ⇄ filtros, hooks con cancelación
│   ├── news/             CP4: feed cursor-based
│   └── sagas/            CP5: tipos, API, mapa SVG, etapa activa, progreso, View Transitions
└── pages/                Pantallas de Wanted, News y Sagas
```

## Decisiones técnicas

- **Estado en la URL (CP2, CP4, CP5):** filtros, página, orden y etapa activa viven en los query
  params; recargar, compartir o usar atrás/adelante muestra lo mismo. Los valores inválidos se ignoran.
- **Respuestas antiguas:** cada request lleva un `AbortController`; al cambiar la consulta se cancela
  la anterior y cualquier respuesta de una consulta vieja se descarta.
- **Sesión:** token en `localStorage`, validado con `GET /auth/me` al recargar. Un 401 en cualquier
  ruta protegida cierra la sesión y vuelve al login; después del login se vuelve a la URL exacta pedida.
- **CP5:** etapa activa con `IntersectionObserver`; mapa SVG persistente con las posiciones de la API;
  CSS Scroll-driven Animations dentro de `@supports` con fallback en JS; View Transition API con
  fallback a navegación normal; `prefers-reduced-motion` desactiva todo movimiento.
