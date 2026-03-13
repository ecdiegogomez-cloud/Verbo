import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const i18nMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Handle API routes protection
    if (pathname.startsWith('/api/')) {
        // Skip authentication if API_SECRET_KEY is not configured (dev mode)
        if (!process.env.API_SECRET_KEY || process.env.API_SECRET_KEY === 'change-me-to-a-secure-random-key') {
            return NextResponse.next();
        }

        const apiKey = request.headers.get('x-api-key');

        // Allow requests from the same origin by checking the referer
        const referer = request.headers.get('referer');
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');
        const protocol = request.nextUrl.protocol === 'https:' ? 'https:' : 'http:';

        // Check if request comes from the same site
        const isSameOrigin =
            referer?.startsWith(`${protocol}//${host}`) ||
            origin?.startsWith(`${protocol}//${host}`);

        // Allow if API key matches or if it's a same-origin request
        if (apiKey === process.env.API_SECRET_KEY || isSameOrigin) {
            return NextResponse.next();
        }

        // Reject unauthorized requests
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Handle i18n for non-API routes
    return i18nMiddleware(request);
}

export const config = {
    matcher: [
        // Match API routes
        '/api/:path*',
        // Match i18n routes
        '/',
        '/(en|es)/:path*',
    ],
};
