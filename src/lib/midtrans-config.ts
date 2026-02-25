// src/lib/midtrans-config.ts
export const MIDTRANS_CONFIG = {
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  snapJsUrl: process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js',
};

export const MIDTRANS_PRICES = {
  monthlyIDR: 31988,
  lifetimeIDR: 51988,
  monthlyUSD: 2.66,
  lifetimeUSD: 7.16,
};

export const isMidtransConfigured = !!MIDTRANS_CONFIG.serverKey && !!MIDTRANS_CONFIG.clientKey;
