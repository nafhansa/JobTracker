// src/lib/paddle-config.ts

export const PADDLE_ENV = {
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') || 'sandbox',
};

export const PADDLE_PRICES = {
    monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_MONTHLY || '',
    lifetime: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_LIFETIME || '',
};

export const isPaddleConfigured = !!PADDLE_ENV.clientToken && !!PADDLE_PRICES.monthly && !!PADDLE_PRICES.lifetime;
