import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectPublicationFile } from './publication-policy.mjs';

test('bloquea exportaciones de personas incluso con esquema y nombres entre comillas', () => {
  for (const sql of ['INSERT INTO usuarios VALUES (1);', 'COPY public."eventos_aprendizaje" FROM stdin;', 'INSERT INTO "public"."intentos_prueba" VALUES (1);']) {
    assert.ok(inspectPublicationFile('database/seed/contenido.sql', sql).some((f) => f.rule.includes('carga de datos')));
  }
});
test('permite estructura y contenido educativo sin confundir texto o comentarios con cargas', () => {
  const sql = "CREATE TABLE usuarios (password_hash text); -- INSERT INTO usuarios\nINSERT INTO vocabulario VALUES ('INSERT INTO usuarios', 'Don''t copy');";
  assert.deepEqual(inspectPublicationFile('database/seed/contenido.sql', sql), []);
});
test('detecta credenciales remotas, permite Docker de ejemplo y no revela los valores', () => {
  const secret = 'no-publicar-esta-clave';
  const text = 'DATABASE_URL=' + `postgresql://administrador:${secret}@servidor.example/base`;
  const result = inspectPublicationFile('backend/config.txt', text);
  assert.ok(result.length > 0);
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.deepEqual(inspectPublicationFile('docker-compose.yml', 'DATABASE_URL: postgres://simiaru:simiaru@db:5432/simiaru'), []);
});
test('bloquea variantes de entorno privadas y nuevos archivos no aprobados de database', () => {
  assert.ok(inspectPublicationFile('backend/.env.staging', '').length);
  assert.ok(inspectPublicationFile('database/exportacion.csv', '').length);
  assert.deepEqual(inspectPublicationFile('backend/.env.example', 'JWT_SECRET=\n'), []);
  assert.deepEqual(inspectPublicationFile('backend/.env.example', 'JWT_SECRET=\nSESSION_SECRET=\nCLOUDINARY_API_KEY=\nCLOUDINARY_API_SECRET=\n'), []);
});
test('detecta tokens y contraseñas SQL sin imprimirlos', () => {
  const token = 'ghp_' + 'A'.repeat(36);
  assert.ok(inspectPublicationFile('config.js', token).length);
  assert.ok(inspectPublicationFile('database/schema.sql', "CREATE ROLE docente LOGIN PASSWORD 'una-clave';").length);
});
