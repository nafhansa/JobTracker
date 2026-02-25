// next.config.mjs
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */

const baseConfig = {
    async headers() {
        return [
            {
                source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://core.spreedly.com https://global.localizecdn.com https://js.stripe.com https://applepay.cdn-apple.com https://cdn.paddle.com https://sandbox-cdn.paddle.com https://effectivelyassets.com https://vercel.live https://apis.google.com https://accounts.google.com https://app.sandbox.midtrans.com https://app.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://api.sandbox.midtrans.com https://pay.google.com https://js-agent.newrelic.com https://bam.nr-data.net https://gwk.gopayapi.com/sdk/stable/gp-container.min.js;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://cdn.paddle.com https://sandbox-cdn.paddle.com;
              font-src 'self' https://fonts.gstatic.com https://vercel.live;
              img-src 'self' data: https://cdn.paddle.com https://sandbox-cdn.paddle.com https://*.googleusercontent.com https://grainy-gradients.vercel.app https://vercel.live;
              connect-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com https://checkout-service.paddle.com https://sandbox-checkout-service.paddle.com https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://vercel.live https://accounts.google.com https://www.googleapis.com https://*.supabase.co wss://*.supabase.co;
              frame-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com https://vercel.live https://accounts.google.com https://*.firebaseapp.com https://app.sandbox.midtrans.com https://app.midtrans.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim(),
                    },
                ],
            },
            {
                source: '/payment/midtrans/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://api.sandbox.midtrans.com https://pay.google.com https://js-agent.newrelic.com https://bam.nr-data.net https://gwk.gopayapi.com/sdk/stable/gp-container.min.js; default-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.midtrans.com https://*.firebaseio.com https://*.firebase.com https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;",
                    },
                ],
            },
            {
                source: '/payment/finish',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com; default-src 'self'; connect-src 'self' https://*.midtrans.com https://*.firebaseio.com https://*.firebase.com https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com; style-src 'self' 'unsafe-inline';",
                    },
                ],
            },
            {
                source: '/api/payment/midtrans/webhook',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'POST, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, x-callback-token, x-signature-key',
                    },
                ],
            },
        ];
    },
};

const config = process.env.NODE_ENV === 'development' 
    ? baseConfig 
    : withPWA({
        dest: 'public',
        disable: process.env.NODE_ENV === 'development',
        register: true,
        skipWaiting: true,
        buildExcludes: [/middleware-manifest\.json$/],
        runtimeCaching: [],
    })(baseConfig);

export default config;
