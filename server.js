'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { URL } = require('node:url');
const { openPartsDatabase, findPartsOrder, createDemoReceipt } = require('./src/database');
const { validateDemoCheckout } = require('./src/validation');

// Server-level XSS defense in depth, together with safe textContent rendering.
const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "connect-src 'self'",
    "img-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store'
});

function sendJson(res, status, value) {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

async function readSmallJson(req) {
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    const error = new Error('Only JSON checkout requests are accepted.');
    error.status = 415;
    throw error;
  }
  let text = '';
  for await (const chunk of req) {
    text += chunk.toString('utf8');
    if (Buffer.byteLength(text, 'utf8') > 4096) {
      const error = new Error('Checkout request is too large.');
      error.status = 413;
      throw error;
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error('The checkout request is not valid JSON.');
    error.status = 400;
    throw error;
  }
}

async function serveAsset(res, name, type) {
  const data = await fs.readFile(path.join(__dirname, 'public', name));
  res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': type });
  res.end(data);
}

function buildServer() {
  const db = openPartsDatabase();
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const assets = {
        '/': ['index.html', 'text/html; charset=utf-8'],
        '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
        '/styles.css': ['styles.css', 'text/css; charset=utf-8']
      };

      if (req.method === 'GET' && assets[url.pathname]) {
        const [file, mime] = assets[url.pathname];
        await serveAsset(res, file, mime);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/order') {
        const orderCode = url.searchParams.get('code') || '';
        if (orderCode.length > 100) {
          sendJson(res, 400, { error: 'Order code is too long.' });
          return;
        }
        const order = findPartsOrder(db, orderCode);
        if (!order) {
          sendJson(res, 404, { error: 'No matching parts order. The SQL query was not changed.' });
          return;
        }
        sendJson(res, 200, { order });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/demo-receipt') {
        // A supplemental local-demo check, not a substitute for full CSRF defense.
        const origin = req.headers.origin;
        if (origin && origin !== `http://${req.headers.host}`) {
          sendJson(res, 403, { error: 'Cross-origin checkout request denied.' });
          return;
        }
        const checked = validateDemoCheckout(await readSmallJson(req));
        if (checked.error) {
          sendJson(res, 400, { error: checked.error });
          return;
        }
        const receipt = createDemoReceipt(db, checked.value);
        if (!receipt) {
          sendJson(res, 404, { error: 'Demo order was not found.' });
          return;
        }
        sendJson(res, 201, { receipt });
        return;
      }

      sendJson(res, 404, { error: 'Page not found.' });
    } catch (error) {
      const status = error.status || 500;
      sendJson(res, status, { error: status === 500 ? 'Unexpected server error.' : error.message });
    }
  });
  server.on('close', () => db.close());
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = buildServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(`AutoZone-inspired parts security lab: http://127.0.0.1:${port}`);
    console.log('Independent educational simulation. No real card data or charges.');
  });
}

module.exports = { buildServer, SECURITY_HEADERS };
