import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNewsFeed } from '../features/news/useNewsFeed';

export default function NewsFeed() {
  const { items, setItems, hasMore, isLoading, error, lastElementRef, updateFilters, fetchNews } = useNewsFeed();
  const location = useLocation();

  // Reflejar el estado actualizado al volver del detalle (Regla de Nami)
  useEffect(() => {
    if (location.state?.updatedNews) {
      const updated = location.state.updatedNews;
      setItems((prev) => prev.map((item) => item.id === updated.id ? updated : item));
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setItems]);

  return (
    <div className="max-w-3xl mx-auto p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">News Coo</h1>
      
      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <select onChange={e => updateFilters('type', e.target.value)} className="bg-gray-800 p-2 rounded outline-none border border-gray-600 focus:border-blue-500">
          <option value="">Todos los tipos</option>
          <option value="WORLD">Mundo</option>
          <option value="BOUNTY">Recompensas</option>
        </select>
        <select onChange={e => updateFilters('status', e.target.value)} className="bg-gray-800 p-2 rounded outline-none border border-gray-600 focus:border-blue-500">
          <option value="">Todos los estados</option>
          <option value="RUMOR">Rumor</option>
          <option value="CONFIRMED">Confirmado</option>
        </select>
      </div>

      {/* Lista de noticias */}
      <div className="flex flex-col gap-4">
        {items.map((news, index) => (
          <div key={news.id} ref={index === items.length - 1 ? lastElementRef : null}>
            <Link 
              to={`/news/${news.id}`} 
              state={{ from: location.pathname + location.search }}
              className="block bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <h2 className="text-xl font-bold">{news.title}</h2>
              <p className="text-gray-400 text-sm mt-1">{news.content.substring(0, 100)}...</p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="bg-gray-700 px-2 py-1 rounded">{news.type}</span>
                <span className={`px-2 py-1 rounded font-bold ${news.status === 'CONFIRMED' ? 'bg-green-900 text-green-300' : news.status === 'DEBUNKED' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                  {news.status}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {isLoading && <p className="text-center mt-6 text-gray-400 animate-pulse">Buscando noticias...</p>}
      
      {error && (
        <div className="text-center mt-6 bg-red-900/30 p-4 rounded-lg border border-red-500">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={() => fetchNews(items.length === 0)} className="bg-red-600 hover:bg-red-500 px-4 py-1 rounded font-bold">
            Reintentar
          </button>
        </div>
      )}

      {!hasMore && !isLoading && items.length > 0 && (
        <p className="text-center text-gray-500 mt-8 mb-4">Has llegado al final del periódico.</p>
      )}
    </div>
  );
}