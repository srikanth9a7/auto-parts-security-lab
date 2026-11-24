'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { buildServer } = require('../server');
let server;
let base;

before(async () => {
  server = buildServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise(resolve => server.close(resolve));
});
const create = (data, headers = {}) => fetch(`${base}/api/demo-receipt`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(data)
});
const valid = { orderCode: 'AZL-4418', buyerName: 'Sample Driver', pickupNote: 'Counter pickup' };

test('valid demo order displays the expected fictional part and total', async () => {
  const res = await fetch(`${base}/api/order?code=AZL-4418`);
  assert.equal(res.status, 200);
  const { order } = await res.json();
  assert.equal(order.part_name, 'All-Season Wiper Blade Pair');
  assert.equal(order.total_cents, 3299);
});

test('SQL injection sample does not alter the prepared statement', async () => {
  const injection = "AZL-4418' OR '1'='1' --";
  const res = await fetch(`${base}/api/order?code=${encodeURIComponent(injection)}`);
  assert.equal(res.status, 404);
  assert.match((await res.json()).error, /No matching parts order/);
});

test('UNION-shaped input is still treated as a literal order code', async () => {
  const injection = "' UNION SELECT 'A','B','C','D',1 --";
  const res = await fetch(`${base}/api/order?code=${encodeURIComponent(injection)}`);
  assert.equal(res.status, 404);
});

test('checkout returns the XSS-shaped note as ordinary JSON data', async () => {
  const markup = '<img src=x onerror=alert(1)>';
  const res = await create({ ...valid, pickupNote: markup });
  assert.equal(res.status, 201);
  const { receipt } = await res.json();
  assert.equal(receipt.pickupNote, markup);
  assert.equal(receipt.totalCents, 3299);
});

test('CSP excludes unsafe inline scripts and disables plugin content', async () => {
  const res = await fetch(base);
  const csp = res.headers.get('content-security-policy');
  assert.match(csp, /script-src 'self'/);
  assert.doesNotMatch(csp, /unsafe-inline/);
  assert.match(csp, /object-src 'none'/);
});

test('checkout blocks invalid order-code syntax', async () => {
  const res = await create({ ...valid, orderCode: "AZL-4418' OR 1=1 --" });
  assert.equal(res.status, 400);
});

test('buyer cannot override a server-side parts total', async () => {
  const res = await create({ ...valid, orderCode: 'AZL-4419', totalCents: 1 });
  assert.equal(res.status, 201);
  assert.equal((await res.json()).receipt.totalCents, 4895);
});

test('requests with a foreign Origin are rejected by demo endpoint', async () => {
  const res = await create(valid, { Origin: 'https://untrusted.example.invalid' });
  assert.equal(res.status, 403);
});

test('oversized order lookup is rejected before SQL processing', async () => {
  const res = await fetch(`${base}/api/order?code=${'Z'.repeat(101)}`);
  assert.equal(res.status, 400);
});

test('checkout rejects an absent buyer name', async () => {
  const res = await create({ ...valid, buyerName: '  ' });
  assert.equal(res.status, 400);
});

test('receipt returns a simulated payment status, not a payment confirmation', async () => {
  const res = await create(valid);
  assert.equal(res.status, 201);
  assert.match((await res.json()).receipt.paymentStatus, /NO MONEY CHARGED/);
});
