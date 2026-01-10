import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Supported locales
 */
const SUPPORTED_LOCALES = ["en", "nl", "de", "fr"];
const DEFAULT_LOCALE = "en";

/**
 * Cookie names
 */
const COOKIE_LOCALE = "lvq_locale";
const COOKIE_PROMO = "lvq_promo";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Paths that don't need locale prefixing
 */
const PUBLIC_PATHS = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

/**
 * Middleware function
 *
 * Handles:
 * 1. Promo code capture from URL params
 * 2. Locale detection and redirection
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // ==========================================================================
  // 1. PROMO CODE CAPTURE
  // ==========================================================================
  const promoCode = searchParams.get("promo");
  if (promoCode) {
    // Store promo code in cookie for 30 days
    response.cookies.set(COOKIE_PROMO, promoCode.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    // Remove promo param from URL (optional - keeps URL clean)
    // Uncomment if you want to remove it:
    // const cleanUrl = new URL(request.url);
    // cleanUrl.searchParams.delete("promo");
    // return NextResponse.redirect(cleanUrl);
  }

  // ==========================================================================
  // 2. LOCALE DETECTION (disabled - links include locale prefix)
  // ==========================================================================

  return response;
}

/**
 * Middleware config
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (Next.js internals)
     * - api (API routes)
     * - static files (favicon, images, etc.)
     */
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
