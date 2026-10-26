import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Zarpar</h2>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-400 outline-none" required />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-400 outline-none" required />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
          {isLoading ? "Iniciando..." : "Iniciar Sesión"}
        </button>
        <p className="mt-4 text-center text-sm text-gray-400">
          ¿No tienes cuenta? <Link to="/register" className="text-blue-400 hover:underline">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}