'use strict';

function validateDemoCheckout(payload) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return { error: 'Checkout must be a JSON object.' };
  }
  const { orderCode, buyerName, pickupNote } = payload;
  if (typeof orderCode !== 'string' || !/^AZL-\d{4}$/.test(orderCode)) {
    return { error: 'Use a demo order code such as AZL-4418.' };
  }
  if (typeof buyerName !== 'string' || !buyerName.trim() || buyerName.trim().length > 60) {
    return { error: 'Buyer name must contain 1–60 characters.' };
  }
  if (typeof pickupNote !== 'string' || pickupNote.length > 240) {
    return { error: 'Pickup note must be no more than 240 characters.' };
  }
  return {
    value: { orderCode, buyerName: buyerName.trim(), pickupNote }
  };
}

module.exports = { validateDemoCheckout };
