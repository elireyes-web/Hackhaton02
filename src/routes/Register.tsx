import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function Register() {
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await apiFetch<{ token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ teamName, email, password }),
      });
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard"; // Recarga para que AuthContext lea el token
    } catch (err: any) {
      setError(err.message || "Error al registrar la tripulación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Registrar Tripulación</h2>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nombre de la Tripulación</label>
          <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-400 outline-none" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-400 outline-none" required />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-400 outline-none" required />
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