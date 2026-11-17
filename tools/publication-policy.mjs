import path from 'node:path';

const PUBLIC_TABLES = new Set(['unidades', 'lecciones', 'vocabulario', 'ejercicios', 'insignias', 'contenido_cultural', 'audios']);
const EXAMPLES = new Set(['simiaru', 'ci-secret', 'ci-session', 'secreto-de-prueba', 'sesion-de-prueba', 'sal-de-prueba', 'solo-para-uso-local-cambiar-en-produccion', 'usuario', 'user', 'username', 'password', 'clave', 'contraseña', 'example', 'changeme']);
export const isPublicDatabaseFile = (file) => /^(?:database\/(?:README\.md|schema\.sql|seed\/contenido\.sql|samples\/eventos_sinteticos\.(?:csv|json))|database\/migrations\/\d{3}_[^/]+\.sql)$/.test(file);

// Solo se devuelven categorías y números de línea: nunca el valor encontrado.
export function inspectPublicationFile(file, text, { historical = false } = {}) {
  const findings = [];
  const add = (rule, index = 0) => findings.push({ rule, line: text.slice(0, index).split('\n').length });
  const name = path.posix.basename(file);
  if (/^\.env/i.test(name) && name !== '.env.example') add('archivo de entorno privado');
  if (/\.(?:pem|key|p12|pfx|dump|backup|bak|sqlite3?|db|sql\.(?:gz|zip))$/i.test(name)) add('clave o respaldo privado');
  if (!historical && file.startsWith('database/') && !isPublicDatabaseFile(file)) add('archivo de base de datos fuera de la lista pública');

  const tokens = [
    ['clave privada', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/g],
    ['token de GitHub', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
    ['clave de AWS', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
    ['clave de Google', /\bAIza[A-Za-z0-9_-]{30,}\b/g],
    ['token de Slack', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g],
    ['clave de Brevo', /\bxkeysib-[A-Za-z0-9-]{30,}\b/g],
    ['token de Hugging Face', /\bhf_[A-Za-z0-9]{30,}\b/g],
    ['JWT literal', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\b/g],
  ];
  for (const [label, regex] of tokens) for (const match of text.matchAll(regex)) add(label, match.index);

  for (const match of text.matchAll(/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s'"<>`]+/gi)) {
    if (match[0].includes('${')) continue; // Interpolación de una variable, no contraseña literal.
    try {
      const url = new URL(match[0]);
      if (!url.password) continue;
      const user = decodeURIComponent(url.username);
      const password = decodeURIComponent(url.password);
      const sampleHost = ['localhost', '127.0.0.1', 'db', 'host'].includes(url.hostname);
      if (!(sampleHost && EXAMPLES.has(user) && EXAMPLES.has(password))) add('URL de base con contraseña literal', match.index);
    } catch { /* Una plantilla de URL incompleta no es una credencial confirmada. */ }
  }
  const assignment = /\b(?:JWT_SECRET|SESSION_SECRET|RESEARCH_SALT|GOOGLE_CLIENT_SECRET|FACEBOOK_APP_SECRET|CLOUDINARY_API_SECRET|CLOUDINARY_API_KEY|BREVO_API_KEY|AWS_SECRET_ACCESS_KEY)[ \t]*[:=][ \t]*['"]?([A-Za-z0-9_./+@=-]{8,})/g;
  for (const match of text.matchAll(assignment)) {
    if (!EXAMPLES.has(match[1]) && !/^(?:process\.env\.|os\.environ\b)/.test(match[1])) add('secreto literal en configuración', match.index);
  }

  if (file.endsWith('.sql')) {
    // Oculta comentarios y literales sin perder las líneas. Los identificadores se conservan.
    const sql = text.replace(/'(?:''|[^'])*'|--[^\r\n]*|\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\r\n]/g, ' '));
    const identifier = '(?:"[^"]+"|[a-zA-Z_][a-zA-Z0-9_]*)';
    const target = new RegExp('\\b(?:INSERT\\s+INTO|COPY)\\s+(?:ONLY\\s+)?(' + identifier + '(?:\\s*\\.\\s*' + identifier + ')?)', 'gi');
    for (const match of sql.matchAll(target)) {
      const table = match[1].replaceAll('"', '').split('.').at(-1).trim().toLowerCase();
      if (!PUBLIC_TABLES.has(table)) add('SQL con carga de datos ajenos al contenido educativo', match.index);
    }
    for (const match of text.matchAll(/\b(?:CREATE|ALTER)\s+(?:USER|ROLE)\b[^;]*\bPASSWORD\s+'[^']+'/gi)) add('contraseña de rol SQL', match.index);
  }
  return findings;
}
