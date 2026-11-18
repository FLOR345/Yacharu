# YachAru 🦙

[English version](README.md)

**YachAru** es una aplicación web para aprender **quechua** y **aymara**, las lenguas originarias de los Andes. Ofrece lecciones por unidades, un diccionario, contenido cultural, seguimiento de progreso y notificaciones.

> *Yachay* significa "aprender, saber" en quechua y *aru* significa "palabra, lengua" en aymara. Antes se llamaba SimiAru: algunas direcciones web y nombres internos conservan ese nombre.

## Demo

- Frontend: https://yacharu-3j6b.vercel.app

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, Motion, Mantine 8, Sonner y efectos visuales propios |
| Backend | Node.js, Express, Passport (Google, Facebook, JWT) |
| Base de datos | PostgreSQL (Neon) |
| Servicios | Cloudinary (imágenes), Brevo (correos), node-cron |
| Despliegue | Vercel (frontend), Render (backend) |

## Estructura

```
YACHARU/
├── backend/        API en Express
│   └── src/
│       ├── config/       base de datos, passport, cloudinary
│       ├── controllers/
│       ├── middleware/
│       ├── routes/       auth, lessons, progress, dictionary, culture, notifications
│       └── utils/
├── frontend/       App en React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── context/
└── database/       migraciones y datos iniciales (SQL)
```

## Cómo ejecutarlo en tu computadora

**La forma más rápida (un comando, necesita Docker):**

```bash
docker compose up --build
```

La app queda en http://localhost:8080 y la API en http://localhost:5000, con la base creada desde `database/schema.sql`, las migraciones y el contenido real (sin datos de personas). Para agregar una lengua, ver [docs/paquete-de-idioma.md](docs/paquete-de-idioma.md); para el audio MMS, [tools/tts/README.md](tools/tts/README.md).

**Sin Docker:**

### Requisitos

- Node.js 18 o superior
- Una base de datos PostgreSQL (local o gratuita en [Neon](https://neon.tech))

### 1. Base de datos

Crea una base vacía. Desde la raíz del repositorio, carga `database/schema.sql`, aplica las migraciones incrementales con `npm run migrate` en `backend` y carga `database/seed/contenido.sql`. Necesitas el cliente `psql` para importar los SQL. Por ejemplo, en Bash, con una base local:

```bash
export DATABASE_URL='postgresql://usuario:clave@localhost:5432/yacharu'
export DATABASE_SSL=false
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/schema.sql
(cd backend && npm ci && npm run migrate)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/seed/contenido.sql
```

Reemplaza usuario, clave y nombre de base por los tuyos. Para Neon usa su cadena de conexión con SSL. El contenido inicial se carga una vez en una base nueva; no ejecutes semillas antiguas sobre una base con estudiantes.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env    # luego completa los valores
npm run dev
```

El servidor queda en `http://localhost:5000` (prueba `http://localhost:5000/health`).

Variables obligatorias en `backend/.env`: `DATABASE_URL`, `JWT_SECRET` y `SESSION_SECRET`. El resto (Google, Facebook, Cloudinary, Brevo) solo hace falta para esas funciones. Mira `backend/.env.example`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La app queda en `http://localhost:5173`.

## Publicar en internet

- **Backend → Render (gratis):** en Render elige *New → Blueprint* y selecciona este repositorio. El archivo `render.yaml` configura todo; solo hay que pegar los valores de `backend/.env.example`. En el plan gratuito el servidor se duerme tras 15 minutos sin uso y tarda unos segundos en despertar.
- **Frontend → Vercel:** carpeta `frontend`, ya apunta al backend de Render (ver `frontend/src/config.js`).

## Seguridad

Las contraseñas y claves **nunca** se escriben en el código: van en archivos `.env`, que están en `.gitignore`.

`database/` incluye únicamente estructura, contenido educativo y muestras sintéticas; consulta [qué contiene cada archivo](database/README.md). Antes de compartir cambios ejecuta `node tools/check-publication.mjs`. La [guía de publicación](docs/publicacion.md) explica cómo preparar el repositorio.

## Autores

- **Flor Melany Yanarico Huanca**: Universidad Nacional del Altiplano, Puno, Perú ([FLOR345](https://github.com/FLOR345))
- **Yeferson Dariun Laura Livise**: Universidad Nacional del Altiplano, Puno, Perú ([DariunLv](https://github.com/DariunLv))
- **Kelly Luzgarda Yanarico Huanca**: Universidad César Vallejo, Perú

Proyecto desarrollado en Puno, Perú, a partir del curso de Desarrollo de Software II.

## Licencia

- **Código:** [AGPL-3.0-or-later](LICENSE). Puedes usarlo, modificarlo y redistribuirlo bajo sus condiciones. Al distribuir una versión modificada cubierta, proporciona su código fuente correspondiente; si las personas interactúan con tu versión modificada por una red, ofréceles ese código de forma visible y gratuita (sección 13).
- **Audio generado:** [CC BY-NC 4.0](LICENSE-AUDIO.md), heredada de los modelos MMS.
- **Efectos visuales** (`frontend/src/components/fx/`): escritos para YachAru, con la misma licencia AGPL-3.0 del código.
- **Contenido lingüístico** (vocabulario, ejercicios y textos culturales): no está cubierto por la licencia AGPL. El vocabulario aymara viene de la lista de aymara central de Félix Layme Pairumani en el Intercontinental Dictionary Series (CC BY 4.0); ver `languages/aymara/README.md`.

## Voz, evidencia y publicación

- **Voz:** el flujo en línea [`Audio MMS`](.github/workflows/audio-mms.yml) genera el audio con los modelos de Meta (`quz`, `ayr`) contra Neon y Cloudinary. Las voces grabadas no se reemplazan.
- **Cobertura en vivo:** https://simiaru.onrender.com/api/validation/cobertura
- **Validación:** `/validacion` (administradores) para revisar el léxico.
- **Estado del envío a SoftwareX:** [`docs/softwarex.md`](docs/softwarex.md). **Decisiones sobre IA:** [`docs/etica-e-ia.md`](docs/etica-e-ia.md).
