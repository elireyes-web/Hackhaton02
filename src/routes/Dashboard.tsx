import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [logPose, setLogPose] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [summaryData, logPoseData] = await Promise.all([
        apiFetch<any>("/dashboard/summary"),
        apiFetch<any>("/log-pose").catch(() => null)
      ]);
      setSummary(summaryData);
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

  if (isLoading) return <div className="p-8 text-center text-white bg-gray-900 min-h-screen">Cargando datos del mundo...</div>;
  if (error) return (
    <div className="p-8 text-center bg-gray-900 min-h-screen text-white">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={fetchData} className="bg-blue-600 px-4 py-2 rounded">Reintentar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400">Dashboard</h1>
          <button onClick={logout} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded">Cerrar Sesión</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl text-gray-400 mb-2">Log Pose</h2>
            <pre className="text-sm text-green-400 overflow-auto">{JSON.stringify(logPose, null, 2)}</pre>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl text-gray-400 mb-2">Resumen</h2>
            <pre className="text-sm text-blue-400 overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}