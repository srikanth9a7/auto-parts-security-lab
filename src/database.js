'use strict';

const { DatabaseSync } = require('node:sqlite');

// All part names, order numbers, and prices below are fictional.
function openPartsDatabase() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE parts_orders (
      order_code TEXT PRIMARY KEY,
      part_name TEXT NOT NULL,
      vehicle_note TEXT NOT NULL,
      pickup_counter TEXT NOT NULL,
      total_cents INTEGER NOT NULL CHECK (total_cents >= 0)
    );
    CREATE TABLE demo_receipts (
      receipt_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL REFERENCES parts_orders(order_code),
      buyer_name TEXT NOT NULL,
      pickup_note TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      simulation_only INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Binding values keeps even the sample seed data separate from SQL syntax.
  const addOrder = db.prepare(`
    INSERT INTO parts_orders
      (order_code, part_name, vehicle_note, pickup_counter, total_cents)
    VALUES (?, ?, ?, ?, ?)
  `);
  addOrder.run('AZL-4418', 'All-Season Wiper Blade Pair', 'Sample fitment: compact sedan', 'Pickup Desk 2', 3299);
  addOrder.run('AZL-4419', '12V Battery Maintenance Kit', 'Sample fitment: crossover SUV', 'Pickup Desk 1', 4895);
  addOrder.run('AZL-4420', 'Ceramic Brake Pad Set', 'Sample fitment: midsize vehicle', 'Pickup Desk 3', 6749);
  return db;
}

function findPartsOrder(db, untrustedOrderCode) {
  // SQL-injection protection: ? is a parameter, not string concatenation.
  const query = db.prepare(`
    SELECT order_code, part_name, vehicle_note, pickup_counter, total_cents
    FROM parts_orders
    WHERE order_code = ?
  `);
  return query.get(untrustedOrderCode) ?? null;
}

function createDemoReceipt(db, { orderCode, buyerName, pickupNote }) {
  const order = findPartsOrder(db, orderCode);
  if (!order) return null;

  // The browser cannot set the price; the server retrieves it from its DB.
  const save = db.prepare(`
    INSERT INTO demo_receipts
      (order_code, buyer_name, pickup_note, total_cents)
    VALUES (?, ?, ?, ?)
  `);
  const result = save.run(orderCode, buyerName, pickupNote, order.total_cents);
  return {
    receiptId: Number(result.lastInsertRowid),
    orderCode: order.order_code,
    partName: order.part_name,
    vehicleNote: order.vehicle_note,
    pickupCounter: order.pickup_counter,
    totalCents: order.total_cents,
    buyerName,
    pickupNote,
    paymentStatus: 'SIMULATION ONLY — NO MONEY CHARGED'
  };
}

module.exports = { openPartsDatabase, findPartsOrder, createDemoReceipt };
