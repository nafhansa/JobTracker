// src/lib/paypal-config.ts
/**
 * PayPal Config - Fixed Version
 * Uses NEXT_PUBLIC_APP_ENV for client-side detection
 */

// VERCEL_ENV tidak tersedia di client-side, jadi pakai NEXT_PUBLIC
const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
const nodeEnv = process.env.NODE_ENV;

// Fallback: Check URL jika di browser
const isPreviewByURL = typeof window !== 'undefined' && 
  (window.location.hostname.includes('-git-') || 
   window.location.hostname.includes('preview') ||
   window.location.hostname.includes('vercel.app'));

export const PAYPAL_ENV = {
  // Sandbox jika: development, atau appEnv === preview, atau URL adalah preview
  isSandbox: nodeEnv === 'development' || appEnv === 'preview' || isPreviewByURL,
  isLive: appEnv === 'production',
  environment: (nodeEnv === 'development' || appEnv === 'preview' || isPreviewByURL) ? 'sandbox' : 'live',
  deploymentType: appEnv || 'unknown',
};

// API URL
export const PAYPAL_API_URL = PAYPAL_ENV.isSandbox
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

// Credentials
export const PAYPAL_CREDENTIALS = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
};

// Webhook ID (required for signature verification)
export const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

// Plan IDs (sama untuk semua environment)
export const PAYPAL_PLANS = {
  monthly: PAYPAL_ENV.isSandbox 
    ? 'P-9LY96685M0375121ANFPLFLQ'  // ✅ Sandbox Plan ID
    : 'P-13B09030DE7786940NFPJG5Y',  // Live Plan ID
  
  lifetime: PAYPAL_ENV.isSandbox
    ? 'PROD-4SM98455X6025103P'  // ✅ Sandbox Product ID
    : 'PROD-UMUXPHUVRXF9G',  // Live Product ID
};

// Debug logging
if (typeof window === 'undefined') {
  // Server-side
  console.log('🔧 [Server] PayPal Config:');
  console.log('  APP_ENV:', appEnv);
  console.log('  NODE_ENV:', nodeEnv);
  console.log('  Mode:', PAYPAL_ENV.environment);
  if (!PAYPAL_WEBHOOK_ID) {
    console.warn('⚠️  PAYPAL_WEBHOOK_ID is not set - webhook verification will fail');
  }
} else {
  // Client-side
  console.log('🔧 [Client] PayPal Config:');
  console.log('  APP_ENV:', appEnv);
  console.log('  URL:', window.location.hostname);
  console.log('  isPreviewByURL:', isPreviewByURL);
  console.log('  Mode:', PAYPAL_ENV.environment);
}