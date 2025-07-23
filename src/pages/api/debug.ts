import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Configurar Airtable con el token
    const apiKey = 'patLUFQebdN5VqGZU.f4176b1dab5da14244683d9b1452e05fd215acbc9802508caf0e7021bc6aa3a7';
    
    Airtable.configure({
      apiKey: apiKey,
      endpointUrl: 'https://api.airtable.com'
    });

    // Intentar listar las bases de datos disponibles
    const response = await fetch('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener bases de datos: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Bases disponibles:', data.bases);
    
    // Intentar diferentes IDs de base y nombres de tabla
    const testCombinations = [
      { baseId: 'AEA Media', tableName: 'Original' },
      { baseId: 'AEA Media', tableName: 'Grid view' },
      { baseId: 'AEA', tableName: 'Original' },
      { baseId: 'appAEA', tableName: 'Original' },
    ];
    
    // Si encontramos bases en la respuesta, añadirlas a las combinaciones de prueba
    if (data.bases && Array.isArray(data.bases)) {
      data.bases.forEach((base: { id: string; name?: string }) => {
        testCombinations.push({ baseId: base.id, tableName: 'Original' });
        
        // Si la base tiene un nombre que incluye "AEA", probar con ese ID
        if (base.name && base.name.includes('AEA')) {
          console.log(`Encontrada base relacionada con AEA: ${base.name} (${base.id})`);
        }
      });
    }
    
    // Probar cada combinación
    const testResults: Record<string, any> = {};
    
    for (const { baseId, tableName } of testCombinations) {
      const key = `${baseId}/${tableName}`;
      testResults[key] = { baseId, tableName };
      
      try {
        console.log(`Probando combinación: Base=${baseId}, Tabla=${tableName}`);
        
        // Intentar obtener las tablas de esta base
        try {
          const tableResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (tableResponse.ok) {
            const tableData = await tableResponse.json();
            testResults[key].tables = tableData.tables || [];
            
            // Si encontramos tablas, registrarlas
            if (tableData.tables && Array.isArray(tableData.tables)) {
              console.log(`Tablas encontradas en ${baseId}:`, tableData.tables.map((t: { name: string }) => t.name));
            }
          } else {
            testResults[key].tablesError = tableResponse.statusText;
          }
        } catch (err) {
          testResults[key].tablesError = err instanceof Error ? err.message : String(err);
        }
        
        // Intentar acceder directamente a los registros
        try {
          const directBase = Airtable.base(baseId);
          const records = await new Promise((resolve, reject) => {
            const results = [];
            directBase(tableName)
              .select({ maxRecords: 1 })
              .eachPage(
                (records, fetchNextPage) => {
                  records.forEach(record => {
                    results.push({ 
                      id: record.id,
                      fields: Object.keys(record.fields)
                    });
                  });
                  resolve(results);
                },
                err => {
                  if (err) reject(err);
                  else resolve(results);
                }
              );
          });
          
          testResults[key].records = records;
          testResults[key].success = true;
          
          console.log(`✅ Éxito con Base=${baseId}, Tabla=${tableName}`);
          if (Array.isArray(records) && records.length > 0) {
            console.log(`Campos disponibles:`, records[0].fields);
          }
        } catch (err) {
          testResults[key].recordsError = err instanceof Error ? err.message : String(err);
          testResults[key].success = false;
          console.log(`❌ Error con Base=${baseId}, Tabla=${tableName}: ${err instanceof Error ? err.message : String(err)}`);
        }
      } catch (err) {
        testResults[key].error = err instanceof Error ? err.message : String(err);
        testResults[key].success = false;
      }
    }
    
    // Devolver toda la información recopilada
    return res.status(200).json({ 
      message: 'Información de depuración',
      bases: data.bases || [],
      testResults,
      token: apiKey.substring(0, 10) + '...'
    });
  } catch (error) {
    console.error('Error en la API de depuración:', error);
    return res.status(500).json({ 
      error: 'Error al obtener información de depuración',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}