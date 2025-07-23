import { NextApiRequest, NextApiResponse } from 'next';
import airtableService from '@/services/airtable';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }

    // Esperar a que se encuentre una combinación que funcione
    if (!airtableService.workingCombination) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar un poco
    }

    const results = await airtableService.search(q);
    
    return res.status(200).json({ results });
  } catch (error) {
    console.error('Error en la API de búsqueda:', error);
    
    // Devolver información más detallada sobre el error
    return res.status(500).json({ 
      error: 'Error al procesar la búsqueda',
      details: error instanceof Error ? error.message : String(error),
      suggestion: 'Intenta visitar la página de depuración en /debug para obtener más información'
    });
  }
}