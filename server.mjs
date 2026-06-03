// Minimal dependency-free static file server for the built SPA.
// Serves dist/ and falls back to index.html for client-side routes.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

// Directory to serve. Defaults to the design prototype in `export/`.
// Set SERVE_DIR=dist to serve the built React app instead.
const SERVE_DIR = process.env.SERVE_DIR || 'export';
const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), SERVE_DIR);
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

async function send(res, filePath, status = 200) {
  const body = await readFile(filePath);
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  const cache = filePath.includes(`${join('', 'assets')}`)
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': cache });
  res.end(body);
}

// Public runtime config, injected from environment variables so secrets/keys
// are never committed. The anon key is a public client key by design.
function configScript() {
  const cfg = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  };
  return `window.__DOJO_CONFIG = ${JSON.stringify(cfg)};`;
}

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);

    if (url === '/config.js') {
      res.writeHead(200, {
        'Content-Type': 'text/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(configScript());
      return;
    }
    // Resolve within ROOT only (block path traversal).
    const rel = normalize(url).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(ROOT, rel);
    if (!filePath.startsWith(ROOT)) filePath = join(ROOT, 'index.html');

    try {
      const s = await stat(filePath);
      if (s.isDirectory()) filePath = join(filePath, 'index.html');
      await send(res, filePath);
      return;
    } catch {
      // Not a real file → SPA fallback.
      await send(res, join(ROOT, 'index.html'));
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
    console.error(err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sudoku Dojo serving ${SERVE_DIR}/ on http://0.0.0.0:${PORT}`);
});
