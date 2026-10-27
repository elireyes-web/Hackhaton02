import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api'; 
import type { NewsItem } from '../features/news/useNewsFeed';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const from = location.state?.from || '/news';

  useEffect(() => {
    apiFetch<NewsItem>(`/news/${id}`)
      .then(setNews)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleVerify = async (newStatus: 'CONFIRMED' | 'DEBUNKED') => {
    setIsUpdating(true);
    setUpdateError('');
    setSuccessMsg('');
    try {
      const updated = await apiFetch<NewsItem>(`/news/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setNews(updated);
      setSuccessMsg(`Noticia marcada como ${newStatus}`);
    } catch (err: any) {
      setUpdateError(err.message || 'Error al verificar la noticia. Reintenta.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-white bg-gray-900 min-h-screen">Cargando noticia...</div>;
  if (error) return <div className="p-8 text-red-500 bg-gray-900 min-h-screen">Error: {error}</div>;
  if (!news) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 text-white bg-gray-900 min-h-screen">
      <button onClick={() => navigate(from, { state: { updatedNews: news } })} className="mb-6 text-blue-400 hover:underline">
        ← Volver al feed
      </button>

      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-2">{news.title}</h1>
        <div className="flex gap-2 text-sm mb-6">
          <span className="bg-gray-700 px-3 py-1 rounded">{news.type}</span>
          <span className={`px-3 py-1 rounded font-bold ${news.status === 'CONFIRMED' ? 'bg-green-600' : news.status === 'DEBUNKED' ? 'bg-red-600' : 'bg-yellow-600'}`}>
            {news.status}
          </span>
        </div>
        
        <p className="text-gray-300 text-lg leading-relaxed mb-8">{news.content}</p>

        {news.status === 'RUMOR' && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-bold mb-4">Verificar Rumor</h3>
            {successMsg && <p className="text-green-400 mb-4">{successMsg}</p>}
            {updateError && <p className="text-red-400 mb-4">{updateError}</p>}
            
            <div className="flex gap-4">
              <button onClick={() => handleVerify('CONFIRMED')} disabled={isUpdating} className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded font-bold disabled:opacity-50">
                {isUpdating ? 'Procesando...' : 'Marcar como Verdadero'}
              </button>
              <button onClick={() => handleVerify('DEBUNKED')} disabled={isUpdating} className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded font-bold disabled:opacity-50">
                {isUpdating ? 'Procesando...' : 'Marcar como Falso'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}