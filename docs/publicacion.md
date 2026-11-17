# Preparación para publicar el código

Los archivos actuales conservan la estructura de la base, el contenido educativo y las muestras sintéticas. No se publican archivos `.env` reales, claves privadas, respaldos ni exportaciones de estudiantes. Las plantillas `.env.example` contienen valores vacíos o ejemplos.

## Hallazgo del historial: atención antes de volver a usarlo

La revisión del 17 de noviembre de 2026 encontró una conexión de Neon con contraseña literal en `backend/src/config/database.js` y un secreto JWT literal en `backend/src/utils/jwt.js` y `backend/src/middleware/authMiddleware.js`, en el commit **`3d0bc830`**. Los valores no se reproducen aquí. La revisión no intentó conectarse con esas credenciales ni determinó si siguen vigentes.

Eliminar esas líneas del código actual no las elimina del historial. `.gitignore` tampoco modifica commits anteriores. Antes de continuar con el historial existente, renueva la contraseña afectada de Neon si aún no fue revocada y cualquier `JWT_SECRET` que reutilice ese valor; actualiza las variables del servidor. Renovar el secreto de firma invalida las sesiones firmadas con la clave anterior. Si se reutilizó una credencial en otro servicio, renueva también esa copia.

La documentación previa menciona además claves de Neon y Cloudinary compartidas por chat. La revisión del repositorio no acredita que se hayan renovado; comprueba su estado en esos servicios.

Por indicación del usuario no se ejecutan `git add`, commits, push ni reescrituras del historial. Para compartir una copia sin los commits antiguos se preparó un ZIP con el árbol público actual, sin `.git` ni archivos privados. No copies la carpeta `.git` antigua a una publicación nueva. Una copia nueva no retira los secretos de un repositorio anterior que ya los haya recibido: revocar credenciales sigue siendo necesario.

ZIP del código preparado: `C:\Users\USUARIO\Downloads\YachAru-publicacion-2026-11-17.zip`.

El ZIP de los seis archivos retirados en la limpieza anterior se conserva por separado: `C:\Users\USUARIO\Downloads\YachAru-retirados-2026-11-17.zip`. No es el paquete para publicar.

## Comprobación repetible

Desde la raíz del repositorio, con Node y Git instalados:

Estas órdenes usan los archivos conocidos por Git. En una carpeta extraída del ZIP todavía sin repositorio, inicializa Git manualmente antes de ejecutarlas; no es necesario preparar archivos ni hacer un commit para comprobarlas.

```bash
node --test tools/check-publication.test.mjs
node tools/check-publication.mjs
```

La segunda orden revisa archivos versionados existentes y archivos nuevos que Git no ignora. Detecta patrones de tokens, contraseñas literales de conexión, archivos privados y SQL que cargue datos en tablas distintas de las siete tablas educativas permitidas. No imprime los valores encontrados. La misma comprobación se ejecuta en CI, sin instalar paquetes ni conectarse a servicios.

Para examinar también las versiones de texto en el historial local:

```bash
node tools/check-publication.mjs --history
```

En este repositorio, la revisión histórica devuelve error por los hallazgos anteriores. Eso es esperado y no impide comprobar por separado que el árbol actual pasa. CI comprueba el árbol del commit recibido; no oculta ni elimina el historial.

El detector usa patrones conocidos: no reconoce cualquier secreto posible ni demuestra que una muestra sea sintética solo por su nombre. Las muestras actuales se contrastaron con su generador. Antes de publicar nuevos datos o contenido generado, revisa su procedencia y derechos.

## Estado del producto

Preparar los archivos para compartir código no corrige automáticamente los defectos funcionales documentados en [la revisión](revision-2026-11-17.md). Siguen pendientes las correcciones de privacidad de cachés/colas, sincronización, progreso, OAuth y dependencias. No se desplegó una versión nueva ni se cambió la base de producción durante esta preparación.
