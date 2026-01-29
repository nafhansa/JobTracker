import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Define CSP
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://core.spreedly.com https://global.localizecdn.com https://js.stripe.com https://applepay.cdn-apple.com https://cdn.paddle.com https://sandbox-cdn.paddle.com https://effectivelyassets.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https://cdn.paddle.com https://sandbox-cdn.paddle.com https://*.googleusercontent.com;
    connect-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com https://checkout-service.paddle.com https://sandbox-checkout-service.paddle.com https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com;
    frame-src 'self' https://buy.paddle.com https://sandbox-buy.paddle.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

    // Set the CSP header in the response
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

// Match all routes except static files and APIs
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
