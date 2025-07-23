Como usuario de la biblioteca digital quiero buscar contenido escribiendo palabras clave en un solo campo, para encontrar rápidamente el archivo que necesito sin navegar por carpetas.

Escenario 1

**Given** que estoy en la página de la biblioteca
**When** la página carga
**Then** veo un campo de búsqueda vacío con un placeholder que indica qué puedo buscar

Escenario 2

**Given** que estoy en la página y el buscador está visible
**When** escribo una palabra clave en el campo y presiono Enter
**Then** veo una lista de resultados que contienen esa palabra en el nombre o las etiquetas

Escenario 3 - Clave

**Given** que veo una lista de resultados donde aparece la imagen del thumbnail del registro cuya imagen se obtiene del parametro "file" del resultado
**When** hago clic en uno de los resultados
**Then** soy dirigido al enlace del documento correspondiente

Escenario 4 - Error

**Given** que escribo una palabra clave que no existe en la biblioteca
**When** presiono Enter
**Then** veo un mensaje indicando que no se encontraron resultados