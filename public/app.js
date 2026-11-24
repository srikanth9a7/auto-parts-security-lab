'use strict';

// Classroom-only, non-exfiltrating test strings. They are not real payment data.
const SQL_INJECTION_EXAMPLE = "AZL-4418' OR '1'='1' --";
const XSS_EXAMPLE = `<img src=x onerror="document.getElementById('script-status').textContent='INJECTED SCRIPT RAN'">`;

const byId = id => document.getElementById(id);
const show = (element, value) => { element.textContent = String(value); };

byId('sql-sample-button').addEventListener('click', () => {
  byId('lookup-code').value = SQL_INJECTION_EXAMPLE;
  show(byId('lookup-result'), 'SQL injection sample inserted. Click Find order to verify the protection.');
});

byId('lookup-button').addEventListener('click', async () => {
  const code = byId('lookup-code').value;
  show(byId('lookup-result'), 'Checking fictional auto-parts orders...');
  try {
    const response = await fetch(`/api/order?code=${encodeURIComponent(code)}`);
    const body = await response.json();
    if (!response.ok) {
      show(byId('lookup-result'), body.error);
      return;
    }
    const order = body.order;
    show(byId('lookup-result'),
      `FOUND ${order.order_code} · ${order.part_name} · ${order.vehicle_note} · ${order.pickup_counter} · $${(order.total_cents / 100).toFixed(2)}`);
  } catch {
    show(byId('lookup-result'), 'Local server is not responding.');
  }
});

byId('xss-sample-button').addEventListener('click', () => {
  byId('pickup-note').value = XSS_EXAMPLE;
  show(byId('script-status'), 'No injected script executed');
});

byId('checkout-form').addEventListener('submit', async event => {
  event.preventDefault();
  const output = byId('receipt-result');
  output.replaceChildren();
  const pending = document.createElement('p');
  pending.textContent = 'Creating the simulated pickup receipt...';
  output.appendChild(pending);

  const input = {
    orderCode: byId('checkout-code').value,
    buyerName: byId('buyer-name').value,
    pickupNote: byId('pickup-note').value
  };
  try {
    const response = await fetch('/api/demo-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    const result = await response.json();
    output.replaceChildren();
    if (!response.ok) {
      const error = document.createElement('p');
      error.textContent = result.error;
      output.appendChild(error);
      return;
    }
    const receipt = result.receipt;
    const lines = [
      `Receipt #${receipt.receiptId} · ${receipt.paymentStatus}`,
      `Part: ${receipt.partName} (${receipt.orderCode})`,
      `Vehicle: ${receipt.vehicleNote}`,
      `Location: ${receipt.pickupCounter}`,
      `Total: $${(receipt.totalCents / 100).toFixed(2)} — not charged`,
      `Customer: ${receipt.buyerName}`,
      `Pickup note: ${receipt.pickupNote}`
    ];
    // XSS DEFENSE: display untrusted receipt fields as text, never HTML.
    for (const value of lines) {
      const paragraph = document.createElement('p');
      paragraph.textContent = value;
      output.appendChild(paragraph);
    }
  } catch {
    output.replaceChildren();
    const error = document.createElement('p');
    error.textContent = 'Local server is not responding.';
    output.appendChild(error);
  }
});
