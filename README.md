# Biblioteca Digital - Buscador Airtable

Aplicación web para buscar contenido en una biblioteca digital almacenada en Airtable. Permite a los usuarios buscar archivos mediante palabras clave en un campo único y visualizar los resultados con imágenes en miniatura.

## Características

- Búsqueda por palabras clave en múltiples campos (nombre, etiquetas, ubicación, contexto, personas)
- Visualización de resultados con imágenes en miniatura
- Interfaz responsive adaptada a dispositivos móviles y de escritorio
- Indicador de carga durante la búsqueda
- Mensajes informativos cuando no se encuentran resultados

## Tecnologías utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Airtable API

## Configuración

1. Clona este repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env.local` con las siguientes variables:
   ```
   AIRTABLE_API_KEY=tu_api_key
   AIRTABLE_BASE_ID=tu_base_id
   AIRTABLE_TABLE_NAME=nombre_de_tu_tabla
   ```
4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Despliegue

Esta aplicación está configurada para ser desplegada en Vercel. Simplemente conecta tu repositorio de GitHub a Vercel y configura las variables de entorno necesarias.

## Estructura del proyecto

- `src/pages/`: Páginas de la aplicación
- `src/services/`: Servicios para conectar con APIs externas
- `src/components/`: Componentes reutilizables
- `public/`: Archivos estáticos

## Licencia

Este proyecto está bajo la licencia MIT.