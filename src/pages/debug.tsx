import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Debug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setDebugInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Head>
        <title>Depuración de Airtable</title>
      </Head>

      <main className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Información de Depuración de Airtable</h1>
        
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        {debugInfo && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Token</h2>
              <p className="bg-gray-100 p-2 rounded">{debugInfo.token}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Bases de Datos</h2>
              {debugInfo.bases && debugInfo.bases.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {debugInfo.bases.map((base: any) => (
                    <li key={base.id} className="bg-gray-50 p-2 rounded">
                      <strong>ID:</strong> {base.id}, <strong>Nombre:</strong> {base.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No se encontraron bases de datos.</p>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Información de Tablas</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(debugInfo.tablesInfo, null, 2)}
              </pre>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Acceso Directo</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(debugInfo.directAccessResult, null, 2)}
              </pre>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Respuesta Completa</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}