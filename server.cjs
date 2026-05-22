const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;

const DIST_DIR = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

function safeRespond(res, status, contentType, data) {
  try {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(data);
  } catch {
    // client disconnected, nothing to do
  }
}

function serveFile(res, filePath, fallbackToIndex = false) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT' && fallbackToIndex) {
        const idx = path.join(DIST_DIR, 'index.html');
        fs.readFile(idx, (e2, d2) => {
          if (e2) { safeRespond(res, 500, 'text/plain', 'Error'); return; }
          safeRespond(res, 200, 'text/html; charset=utf-8', d2);
        });
      } else {
        safeRespond(res, 404, 'text/plain', 'Not found');
      }
      return;
    }
    const ext = path.extname(filePath);
    safeRespond(res, 200, MIME[ext] || 'application/octet-stream', data);
  });
}

const srv = http.createServer((req, res) => {
  res.on('error', () => {});
  req.on('error', () => {});

  let url = req.url === '/' ? '/index.html' : req.url;
  const hasExt = path.extname(url) !== '';
  const filePath = path.join(DIST_DIR, url);
  if (!hasExt) {
    const idx = path.join(DIST_DIR, 'index.html');
    fs.readFile(idx, (e, d) => {
      if (e) { safeRespond(res, 500, 'text/plain', 'Error'); return; }
      safeRespond(res, 200, 'text/html; charset=utf-8', d);
    });
    return;
  }
  serveFile(res, filePath, true);
});

srv.on('error', (err) => {
  console.error('Server error:', err.message);
});

srv.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log('  🏦  Bank Simulator Game');
  console.log('  ─────────────────────────');
  console.log(`  📡  ${url}`);
  console.log('');
  console.log('  Press Ctrl+C to stop');
  console.log('');

  const cmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd);
});
