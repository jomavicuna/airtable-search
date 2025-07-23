import Airtable from 'airtable';

// Tipos para los resultados de Airtable
export interface AirtableRecord {
  id: string;
  name?: string;
  thumbnailUrl?: string;
  documentUrl?: string;
  tags?: string[];
  location_tag?: string;
  context_tag?: string;
  people_tag?: string;
  [key: string]: any;
}

export interface SearchResult {
  id: string;
  name: string;
  thumbnailUrl: string;
  documentUrl: string;
  tags: string[];
  location_tag?: string;
  context_tag?: string;
  people_tag?: string;
}

class AirtableService {
  private base: any;
  private _isConnected: boolean = false;
  private tableName: string = 'files'; // Nombre correcto de la tabla
  private baseId: string = 'app64AZuGEypIXAa7'; // ID correcto de la base
  private apiKey: string = 'patLUFQebdN5VqGZU.f4176b1dab5da14244683d9b1452e05fd215acbc9802508caf0e7021bc6aa3a7';
  public workingCombination: { baseId: string, tableName: string } | null = {
    baseId: 'app64AZuGEypIXAa7',
    tableName: 'files'
  };

  constructor() {
    // Inicializar la conexión
    this.connect();
    // Intentar encontrar una combinación que funcione
    this.findWorkingCombination();
  }

  /**
   * Intenta encontrar una combinación de baseId y tableName que funcione
   */
  // Ya no necesitamos buscar combinaciones, ya tenemos la correcta
  async findWorkingCombination(): Promise<void> {
    console.log('Usando la combinación conocida:', this.workingCombination);
    return;
  }

  connect(): boolean {
    try {
      // Usar directamente el token completo que tenemos
      const apiKey = this.apiKey;
      
      console.log('Conectando a Airtable con:', { apiKey: apiKey.substring(0, 10) + '...', baseId: this.baseId, tableName: this.tableName });

      Airtable.configure({
        apiKey: apiKey,
        endpointUrl: 'https://api.airtable.com'
      });

      // Inicializar la base con el ID correcto
      this.base = Airtable.base(this.baseId);
      this._isConnected = true;
      return true;
    } catch (error) {
      console.error('Error al conectar con Airtable:', error);
      this._isConnected = false;
      return false;
    }
  }

  /**
   * Verifica si la conexión está establecida
   * @returns {boolean} - Estado de la conexión
   */
  isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Establece el nombre de la tabla a utilizar
   * @param {string} tableName - Nombre de la tabla
   */
  setTableName(tableName: string): void {
    this.tableName = tableName;
  }

  /**
   * Obtiene registros de Airtable
   * @returns {Promise<AirtableRecord[]>} - Registros obtenidos
   */
  async getRecords(): Promise<AirtableRecord[]> {
    if (!this._isConnected) {
      throw new Error('No hay conexión con Airtable');
    }

    try {
      // Si tenemos una combinación que funciona, usarla
      if (this.workingCombination) {
        this.baseId = this.workingCombination.baseId;
        this.tableName = this.workingCombination.tableName;
        this.base = Airtable.base(this.baseId);
      }
      
      console.log(`Obteniendo registros de la tabla "${this.tableName}" en la base "${this.baseId}"`);
      
      return new Promise((resolve, reject) => {
        const records: AirtableRecord[] = [];

        this.base(this.tableName)
          .select({
            maxRecords: 100, // Aumentamos el límite para obtener más resultados
          })
          .eachPage(
            (pageRecords: any[], fetchNextPage: () => void) => {
              console.log(`Recibidos ${pageRecords.length} registros de Airtable`);
              pageRecords.forEach((record) => {
                records.push({
                  id: record.id,
                  ...record.fields
                });
              });
              fetchNextPage();
            },
            (error: Error) => {
              if (error) {
                console.error('Error en eachPage:', error);
                reject(error);
                return;
              }
              console.log(`Total de registros obtenidos: ${records.length}`);
              resolve(records);
            }
          );
      });
    } catch (error) {
      console.error('Error al obtener registros:', error);
      throw error;
    }
  }

  /**
   * Busca registros en Airtable según un término de búsqueda
   * @param {string} term - Término de búsqueda
   * @returns {Promise<SearchResult[]>} - Resultados de la búsqueda
   */
  async search(term: string): Promise<SearchResult[]> {
    if (!this._isConnected) {
      throw new Error('No hay conexión con Airtable');
    }

    if (!term) {
      return [];
    }

    try {
      console.log(`Buscando "${term}" en Airtable...`);
      const records = await this.getRecords();
      console.log(`Registros obtenidos para búsqueda: ${records.length}`);
      
      // Campos en los que buscar, según los parámetros de búsqueda
      // Basado en la estructura real de la tabla "files"
      const searchFields = ['Name', 'tags', 'location_tag', 'context_tag', 'people_tag', 'folder_path', 'folder_name_clean'];
      
      // Filtrar registros que contienen el término de búsqueda en alguno de los campos
      const results = records.filter(record => {
        return searchFields.some(field => {
          const value = record[field];
          if (!value) return false;
          
          if (Array.isArray(value)) {
            return value.some(item => 
              item.toString().toLowerCase().includes(term.toLowerCase())
            );
          }
          
          return value.toString().toLowerCase().includes(term.toLowerCase());
        });
      });

      console.log(`Resultados encontrados: ${results.length}`);
      
      // Mapear los resultados al formato esperado
      return results.map(record => {
        // Registrar los campos disponibles para depuración
        console.log('Campos disponibles en el registro:', Object.keys(record));
        
        return {
          id: record.id,
          name: record.Name || record.google_id || 'Sin nombre',
          thumbnailUrl: record.file?.[0]?.url || '', // Los archivos adjuntos están en un array
          documentUrl: record.url || '',
          tags: record.tags ? record.tags.toString().split(', ') : [],
          location_tag: Array.isArray(record.location_tag) ? record.location_tag.join(', ') : (record.location_tag || ''),
          context_tag: Array.isArray(record.context_tag) ? record.context_tag.join(', ') : (record.context_tag || ''),
          people_tag: Array.isArray(record.people_tag) ? record.people_tag.join(', ') : (record.people_tag || '')
        };
      });
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export const airtableService = new AirtableService();

export default airtableService;