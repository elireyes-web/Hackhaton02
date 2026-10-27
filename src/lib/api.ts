const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("Falta VITE_API_BASE_URL en el archivo .env");
}

/** Se dispara cuando una ruta protegida responde 401: AuthContext cierra la sesión. */
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

/** Login y registro pueden responder 401/409 sin que eso signifique "sesión vencida". */
const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register"];

export class ApiError extends Error {
  status: number;
  code: string;
  /** Datos extra del servidor (por ejemplo, qué campo falló). */
  details: unknown;

  constructor(status: number, code: string, message: string, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** fetch cancelado con AbortController (no es un error real para el usuario). */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Mensaje legible para cualquier error, sin usar `any`. */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // Formato de error de la API: { status, code, message, traceId, ... }
    const body: unknown = await res.json().catch(() => null);
    const data = isRecord(body) ? body : {};
    const code =
      typeof data.code === "string" ? data.code : typeof data.error === "string" ? data.error : "UNKNOWN_ERROR";
    const message =
      typeof data.message === "string" ? data.message : "Ocurrió un error inesperado en el servidor";
    const details = data.details ?? data.fields ?? data.errors ?? null;

    // Sesión inválida en una ruta protegida: se borra el token y la app vuelve al login.
    if (res.status === 401 && !PUBLIC_AUTH_PATHS.includes(path)) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(res.status, code, message, details);
  }

  if (res.status === 204) return {} as T;

  return (await res.json()) as T;
}
