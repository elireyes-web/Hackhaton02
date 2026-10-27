import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch, errorMessage, isRecord } from "../lib/api";

type Field = "teamName" | "email" | "password";
type FieldErrors = Partial<Record<Field, string>>;

const FIELD_ALIASES: Record<string, Field> = {
  teamname: "teamName",
  team: "teamName",
  name: "teamName",
  email: "email",
  password: "password",
};

function toField(raw: string): Field | null {
  return FIELD_ALIASES[raw.replace(/[^a-z]/gi, "").toLowerCase()] ?? null;
}

/**
 * Traduce un error del servidor a "qué campo falló".
 * 1) Si la API manda detalles por campo ({ field } o { email: "..." } o [{ field, message }]), se usan.
 * 2) Si no, se deduce del código o del mensaje (ej. EMAIL_TAKEN, "nombre ya registrado").
 */
function fieldErrorsFrom(error: ApiError): FieldErrors {
  const result: FieldErrors = {};
  const details = error.details;
  const items = Array.isArray(details) ? details : isRecord(details) ? [details] : [];

  for (const item of items) {
    if (!isRecord(item)) continue;
    if (typeof item.field === "string") {
      const field = toField(item.field);
      if (field) result[field] = typeof item.message === "string" ? item.message : error.message;
      continue;
    }
    for (const [key, value] of Object.entries(item)) {
      const field = toField(key);
      if (field) result[field] = typeof value === "string" ? value : error.message;
    }
  }
  if (Object.keys(result).length > 0) return result;

  const text = `${error.code} ${error.message}`.toLowerCase();
  if (text.includes("email") || text.includes("correo")) result.email = error.message;
  else if (text.includes("team") || text.includes("nombre") || text.includes("name") || text.includes("tripulaci")) result.teamName = error.message;
  else if (text.includes("password") || text.includes("contraseña")) result.password = error.message;
  return result;
}

const inputClass = "w-full p-2 rounded bg-gray-700 border focus:border-green-400 outline-none";

export default function Register() {
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ teamName, email, password }),
      });
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard"; // Recarga para que AuthContext lea el token
    } catch (err: unknown) {
      const byField = err instanceof ApiError ? fieldErrorsFrom(err) : {};
      if (Object.keys(byField).length > 0) setFieldErrors(byField);
      else setError(errorMessage(err, "Error al registrar la tripulación"));
    } finally {
      setIsLoading(false);
    }
  };

  const borderFor = (field: Field) => (fieldErrors[field] ? "border-red-500" : "border-gray-600");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md" noValidate>
        <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Registrar Tripulación</h2>
        {error && <div role="alert" className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        <div className="mb-4">
          <label htmlFor="teamName" className="block text-sm font-medium mb-1">Nombre de la Tripulación</label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className={`${inputClass} ${borderFor("teamName")}`}
            aria-invalid={Boolean(fieldErrors.teamName)}
            aria-describedby={fieldErrors.teamName ? "teamName-error" : undefined}
            required
          />
          {fieldErrors.teamName && <p id="teamName-error" className="mt-1 text-sm text-red-400">{fieldErrors.teamName}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} ${borderFor("email")}`}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            required
          />
          {fieldErrors.email && <p id="email-error" className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} ${borderFor("password")}`}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            required
          />
          {fieldErrors.password && <p id="password-error" className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>}
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
          {isLoading ? "Registrando..." : "Crear Cuenta"}
        </button>
        <p className="mt-4 text-center text-sm text-gray-400">
          ¿Ya tienes cuenta? <Link to="/login" className="text-green-400 hover:underline">Inicia Sesión</Link>
        </p>
      </form>
    </div>
  );
}
