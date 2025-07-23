import airtableService from '../airtable';

// Mock de las variables de entorno
process.env.AIRTABLE_API_KEY = 'test-api-key';
process.env.AIRTABLE_BASE_ID = 'test-base-id';

// Mock de Airtable
jest.mock('airtable', () => {
  const mockEachPage = jest.fn((callback, done) => {
    callback([
      {
        id: 'rec123',
        fields: {
          name: 'Test Document',
          file: 'https://example.com/thumbnail.jpg',
          url: 'https://example.com/document',
          tags: ['test', 'document'],
          location_tag: 'office',
          context_tag: 'project',
          people_tag: 'team'
        }
      }
    ], () => {});
    done();
  });

  const mockSelect = jest.fn(() => ({
    eachPage: mockEachPage
  }));

  const mockBase = jest.fn(() => mockSelect);

  return {
    configure: jest.fn(),
    base: jest.fn(() => mockBase)
  };
});

describe('AirtableService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería conectarse a Airtable', () => {
    const result = airtableService.connect();
    expect(result).toBe(true);
  });

  test('debería obtener registros de Airtable', async () => {
    const records = await airtableService.getRecords();
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe('Test Document');
  });

  test('debería buscar registros por término', async () => {
    const results = await airtableService.search('test');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Test Document');
  });

  test('debería devolver array vacío si no hay término de búsqueda', async () => {
    const results = await airtableService.search('');
    expect(results).toHaveLength(0);
  });
});