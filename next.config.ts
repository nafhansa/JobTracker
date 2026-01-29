import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://core.spreedly.com https://global.localizecdn.com https://js.stripe.com https://applepay.cdn-apple.com https://cdn.paddle.com https://sandbox-cdn.paddle.com https://effectivelyassets.com https://vercel.live;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live;
              font-src 'self' https://fonts.gstatic.com https://vercel.live;
              img-src 'self' data: https://cdn.paddle.com https://sandbox-cdn.paddle.com https://*.googleusercontent.com https://grainy-gradients.vercel.app https://vercel.live;
              connect-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com https://checkout-service.paddle.com https://sandbox-checkout-service.paddle.com https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://vercel.live;
              frame-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com https://vercel.live;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
