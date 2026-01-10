import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Supported locales
 */
const SUPPORTED_LOCALES = ["en", "nl", "de", "fr"];
const DEFAULT_LOCALE = "nl";

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
 * 2. Locale detection and URL-to-cookie sync
 * 3. Root path redirect to preferred locale
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ==========================================================================
  // 1. LOCALE DETECTION & URL-TO-COOKIE SYNC
  // ==========================================================================
  const urlLocale = pathname.split("/")[1];
  const isValidLocale = SUPPORTED_LOCALES.includes(urlLocale ?? "");

  // Handle root path: redirect to saved locale or default
  if (pathname === "/") {
    const savedLocale = request.cookies.get(COOKIE_LOCALE)?.value?.toLowerCase();
    const targetLocale = SUPPORTED_LOCALES.includes(savedLocale ?? "")
      ? savedLocale
      : DEFAULT_LOCALE;
    return NextResponse.redirect(new URL(`/${targetLocale}`, request.url));
  }

  const response = NextResponse.next();

  // If URL has valid locale, sync cookie to URL (URL is source of truth)
  if (isValidLocale) {
    response.cookies.set(COOKIE_LOCALE, urlLocale!.toUpperCase(), {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  // ==========================================================================
  // 2. PROMO CODE CAPTURE
  // ==========================================================================
  const promoCode = searchParams.get("promo");
  if (promoCode) {
    // Store promo code in cookie for 30 days
    response.cookies.set(COOKIE_PROMO, promoCode.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });
  }

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
