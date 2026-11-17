// Revisión de publicación sin red, sin modificar archivos y sin escribir en el índice de Git.
// Uso desde la raíz: node tools/check-publication.mjs [--history]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspectPublicationFile } from './publication-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (args, options = {}) => execFileSync('git', args, { cwd: root, maxBuffer: 128 * 1024 * 1024, ...options });
const textFile = (f) => /(?:\.(?:[cm]?jsx?|py|sql|json|md|cff|ya?ml|toml|ini|conf|txt|csv|html|css|webmanifest|ps1|sh)|(?:^|\/)(?:Dockerfile|\.env[^/]*|\.gitignore|\.dockerignore))$/i.test(f);
const files = [...new Set(git(['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean))].sort();
const findings = [];
const add = (file, text, options) => {
  for (const item of inspectPublicationFile(file, text, options)) findings.push({ file, ...item, ...(options?.historical ? { historical: true } : {}) });
};
let current = 0;
for (const file of files) {
  const full = path.resolve(root, file);
  if (!fs.existsSync(full)) continue; // Una eliminación aún no preparada no se publicará.
  if (fs.lstatSync(full).isSymbolicLink()) { findings.push({ file, line: 1, rule: 'enlace simbólico: revisar destino antes de publicar' }); continue; }
  const buffer = fs.readFileSync(full);
  current++;
  add(file, textFile(file) && !buffer.includes(0) ? buffer.toString('utf8') : '');
}
let historical = 0;
if (process.argv.includes('--history')) {
  const objects = git(['rev-list', '--objects', '--all'], { encoding: 'utf8' }).split('\n').map((line) => {
    const at = line.indexOf(' ');
    return at < 0 ? null : { oid: line.slice(0, at), file: line.slice(at + 1) };
  }).filter((o) => o && textFile(o.file));
  const result = spawnSync('git', ['cat-file', '--batch'], { cwd: root, input: objects.map((o) => o.oid).join('\n') + '\n', maxBuffer: 128 * 1024 * 1024 });
  if (result.status !== 0) throw new Error('No se pudo leer el historial para la comprobación.');
  let offset = 0;
  for (const object of objects) {
    const end = result.stdout.indexOf(10, offset);
    const header = result.stdout.subarray(offset, end).toString('utf8');
    const [oid, type, sizeText] = header.split(' ');
    const size = Number(sizeText);
    if (oid !== object.oid || type !== 'blob' || !Number.isSafeInteger(size)) throw new Error('Respuesta inesperada de git cat-file.');
    const buffer = result.stdout.subarray(end + 1, end + 1 + size);
    offset = end + 1 + size + 1;
    if (!buffer.includes(0)) { historical++; add(object.file, buffer.toString('utf8'), { historical: true }); }
  }
}
console.log(JSON.stringify({ archivos_actuales: current, blobs_texto_historial: historical, hallazgos: findings }, null, 2));
if (findings.length) process.exitCode = 1;
