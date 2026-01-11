import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { T } from "gt-react";
import { useCart, useLocale, supportedLanguages } from "~/contexts";
import type { LanguageCode } from "~/server/shopify";

/**
 * Header component
 *
 * Main navigation header with cart, language, and currency selectors.
 * Design: Clean white with cream accent, ochre highlights.
 */
export function Header() {
  const router = useRouter();
  const { cart, toggleCart } = useCart();
  const { locale, setLanguage } = useLocale();

  // Get display locale from URL directly (more reliable than context on first render)
  // This prevents the dropdown from showing wrong language on initial load
  const displayLocale = useMemo(() => {
    if (typeof window !== "undefined") {
      const pathLocale = window.location.pathname.split("/")[1]?.toUpperCase();
      if (["NL", "EN", "DE", "FR"].includes(pathLocale ?? "")) {
        return pathLocale as LanguageCode;
      }
    }
    return locale.language;
  }, [locale.language]);

  // Handle language change - update context and navigate
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);

    // Update URL to new locale
    const newLocale = newLanguage.toLowerCase();
    const currentPath = router.asPath;

    // Replace locale in path (e.g., /nl/collections/pet -> /en/collections/pet)
    const pathSegments = currentPath.split("/");
    if (pathSegments[1] && ["nl", "en", "de", "fr"].includes(pathSegments[1])) {
      pathSegments[1] = newLocale;
    } else {
      // If no locale in path, add it
      pathSegments.splice(1, 0, newLocale);
    }

    const newPath = pathSegments.join("/") || `/${newLocale}`;
    void router.push(newPath);
  };

  return (
    <header className="bg-white border-b border-cream-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo with hover glow */}
          <Link href="/" className="flex items-center group">
            <span className="font-display text-2xl font-bold tracking-tight text-charcoal transition-all duration-300 group-hover:scale-[1.02]">
              La{" "}
              <span className="text-ochre-600 group-hover:text-ochre-500 transition-colors group-hover:drop-shadow-[0_0_8px_rgba(233,168,54,0.4)]">
                Vistique
              </span>
            </span>
          </Link>

          {/* Navigation with underline animation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href={`/${locale.language.toLowerCase()}/collections/pet`}
              className="nav-link text-sm font-medium text-stone-600 hover:text-charcoal uppercase tracking-wide transition-colors"
            >
              <T>Portretten</T>
            </Link>
            <Link
              href={`/${locale.language.toLowerCase()}/collections/illustration`}
              className="nav-link text-sm font-medium text-stone-600 hover:text-charcoal uppercase tracking-wide transition-colors"
            >
              <T>Illustraties</T>
            </Link>
            <Link
              href={`/${locale.language.toLowerCase()}/collections/pet-jigsaw-puzzle`}
              className="nav-link text-sm font-medium text-stone-600 hover:text-charcoal uppercase tracking-wide transition-colors"
            >
              <T>Puzzels</T>
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Language selector with custom styling */}
            <div className="relative flex items-center">
              <svg
                className="absolute left-0 w-4 h-4 text-stone-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <select
                value={displayLocale}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                className="pl-6 pr-6 py-1.5 text-sm font-medium text-stone-600 border-none bg-transparent cursor-pointer focus:ring-0 focus:outline-none appearance-none hover:text-charcoal transition-colors"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-0 w-4 h-4 text-stone-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Cart button with pulse on items */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-stone-600 hover:text-charcoal hover:scale-105 transition-all duration-200"
              aria-label="Open cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cart.totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-ochre-500 text-charcoal text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-ring">
                  {cart.totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
