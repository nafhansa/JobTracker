// src/lib/paypal-config.ts
/**
 * PayPal Config - Simplified Version
 * Auto-detects environment based on Vercel deployment
 */

const isVercelProduction = process.env.VERCEL_ENV === 'production';
const isVercelPreview = process.env.VERCEL_ENV === 'preview';
const isDevelopment = process.env.NODE_ENV === 'development';

export const PAYPAL_ENV = {
  isSandbox: isDevelopment || isVercelPreview,
  isLive: isVercelProduction,
  environment: (isDevelopment || isVercelPreview) ? 'sandbox' : 'live',
};

// API URL (for cancellation API)
export const PAYPAL_API_URL = PAYPAL_ENV.isSandbox
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

// Credentials - Vercel will load the correct ones based on environment
export const PAYPAL_CREDENTIALS = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
};

// Plan IDs - SAME for both sandbox and live
export const PAYPAL_PLANS = {
  monthly: 'P-13B09030DE7786940NFPJG5Y',
  lifetime: 'PROD-UMUXPHUVRXF9G',
};

// Debug log
if (typeof window === 'undefined') {
  console.log(`🔧 PayPal: ${PAYPAL_ENV.environment} mode`);
}