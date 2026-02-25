// src/lib/midtrans-config.ts
export const MIDTRANS_CONFIG = {
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  apiUrl: process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com',
  snapJsUrl: process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js',
};

export const MIDTRANS_PRICES = {
  monthlyIDR: 30000,
  lifetimeIDR: 50000,
};

export const isMidtransConfigured = !!MIDTRANS_CONFIG.serverKey && !!MIDTRANS_CONFIG.clientKey;
