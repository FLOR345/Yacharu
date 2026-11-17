# Base de datos: archivos públicos

Esta carpeta contiene instrucciones para crear una base vacía y cargar contenido educativo. No es una copia de la base de producción de Neon.

| Archivo | Contenido |
| --- | --- |
| `schema.sql` | Tablas, columnas, restricciones e índices; no contiene filas de usuarios ni contraseñas. |
| `migrations/NNN_*.sql` | Cambios de estructura y adaptación del contenido. La migración 003 registra audios existentes mediante `INSERT ... SELECT`; no incluye registros de estudiantes. |
| `seed/contenido.sql` | Unidades, lecciones, vocabulario, ejercicios, insignias, textos culturales e índice de audios. Se conservan sus licencias y atribuciones. |
| `samples/eventos_sinteticos.csv` y `.json` | Ejemplos inventados con `backend/scripts/generate-sample-dataset.js`. No son exportaciones reales de estudiantes. |

La tabla `usuarios` debe existir para que la aplicación funcione. Publicar su definición no publica sus filas: `password_hash VARCHAR(255)` solo declara una columna.

Las copias reales, exportaciones y credenciales se guardan fuera del repositorio. `.gitignore` permite en esta carpeta únicamente los archivos anteriores y las migraciones numeradas. No publiques nombres de estudiantes, correos, hashes de contraseñas, códigos de acceso, progreso, evaluaciones ni eventos reales, aunque estén seudonimizados.

Para instalar, usa Docker desde la raíz (`docker compose up --build`) o sigue el orden de [README.es.md](../README.es.md): esquema → migraciones incrementales → contenido. No ejecutes exportaciones de una base de personas como semillas.

Antes de compartir cambios, desde la raíz:

```bash
node tools/check-publication.mjs
```

La comprobación señala nombres de archivo, líneas y categorías sin imprimir secretos. Revisa la [guía de publicación](../docs/publicacion.md) para conocer el hallazgo histórico y los límites de esta comprobación.
