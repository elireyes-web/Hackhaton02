
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-xl mb-8">Isla no encontrada en el mapa.</p>
      <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded">Volver al Dashboard</Link>
    </div>
  );
}