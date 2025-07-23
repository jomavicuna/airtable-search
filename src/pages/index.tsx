import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { SearchResult } from '@/services/airtable';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Error al realizar la búsqueda');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      console.error('Error de búsqueda:', err);
      setError('Ocurrió un error al procesar tu búsqueda. Por favor, intenta de nuevo.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Biblioteca Digital - Búsqueda</title>
        <meta name="description" content="Búsqueda en la biblioteca digital" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Biblioteca Digital</h1>
        
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, etiquetas, ubicación..."
              className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? '...' : 'Buscar'}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">Cargando resultados...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-4">
            <p>{error}</p>
            <p className="mt-2 text-sm">
              <a href="/debug" className="underline">Ver información de depuración</a>
            </p>
          </div>
        )}

        {!isLoading && !error && results.length === 0 && hasSearched && (
          <div className="text-center py-8">
            <p className="text-lg">No se encontraron resultados para "{searchTerm}".</p>
            <p className="mt-2 text-gray-600">Intenta con otras palabras clave o términos más generales.</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <p className="text-center mb-6">Se encontraron {results.length} resultados para "{searchTerm}"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <div 
                  key={result.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleResultClick(result.documentUrl)}
                >
                  <div className="relative h-48 bg-gray-200">
                    {result.thumbnailUrl ? (
                      <Image
                        src={result.thumbnailUrl}
                        alt={result.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          // Fallback para imágenes que no cargan
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-200">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{result.name}</h3>
                    
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {result.tags.length > 3 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            +{result.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 text-sm text-gray-600">
                      {result.location_tag && (
                        <p className="truncate">
                          <span className="font-medium">Ubicación:</span> {result.location_tag}
                        </p>
                      )}
                      {result.context_tag && (
                        <p className="truncate">
                          <span className="font-medium">Contexto:</span> {result.context_tag}
                        </p>
                      )}
                      {result.people_tag && (
                        <p className="truncate">
                          <span className="font-medium">Personas:</span> {result.people_tag}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}