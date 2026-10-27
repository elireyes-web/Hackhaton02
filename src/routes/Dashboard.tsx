import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

// Tipos basados en lo que devuelve tu API
interface DashboardData {
  team: { code: string; name: string };
  wanted: { total: number; totalBounty: number };
  crews: { total: number };
  // ... puedes agregar más si los necesitas
}

interface LogPoseData {
  status: string;
  grandLineUnlocked: boolean;
  message?: string;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [logPose, setLogPose] = useState<LogPoseData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [summaryData, logPoseData] = await Promise.all([
        apiFetch<DashboardData>("/dashboard/summary"),
        apiFetch<LogPoseData>("/log-pose").catch(() => null)
      ]);
      setData(summaryData);
      setLogPose(logPoseData);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
      } else {
        setError(err.message || "Error al cargar el dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl animate-pulse">Cargando datos del mundo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-red-400 mb-4 text-xl">{error}</p>
        <button onClick={fetchData} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400">Dashboard</h1>
            {data && (
              <p className="text-gray-400 mt-2">
                Tripulación: <span className="text-white font-semibold">{data.team.name}</span> ({data.team.code})
              </p>
            )}
          </div>
          <button onClick={logout} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold transition-colors">
            Cerrar Sesión
          </button>
        </div>

        {/* Tarjetas de métricas */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Carteles Activos</h2>
              <p className="text-3xl font-bold text-blue-400">{data.wanted.total}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Recompensa Total</h2>
              <p className="text-3xl font-bold text-green-400">
                ฿ {data.wanted.totalBounty.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Tripulaciones</h2>
              <p className="text-3xl font-bold text-purple-400">{data.crews.total}</p>
            </div>
          </div>
        )}

        {/* Estado del Log Pose */}
        {logPose && (
          <div className={`p-6 rounded-lg shadow-lg border ${logPose.grandLineUnlocked ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'}`}>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              {logPose.grandLineUnlocked ? "🧭 Log Pose Desbloqueado" : "🔒 Log Pose Bloqueado"}
            </h2>
            <p className="text-gray-300">{logPose.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}