import Link from "next/link";
import { useRouter } from "next/router";
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
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="font-display text-2xl font-bold tracking-tight text-charcoal">
              La <span className="text-ochre-600 group-hover:text-ochre-500 transition-colors">Vistique</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href={`/${locale.language.toLowerCase()}/collections/pet`}
              className="text-sm font-medium text-stone-600 hover:text-charcoal uppercase tracking-wide transition-colors"
            >
              <T>Portretten</T>
            </Link>
            <Link
              href={`/${locale.language.toLowerCase()}/collections/illustration`}
              className="text-sm font-medium text-stone-600 hover:text-charcoal uppercase tracking-wide transition-colors"
            >
              <T>Illustraties</T>
            </Link>
            <Link
              href={`/${locale.language.toLowerCase()}/collections/pet-jigsaw-puzzle`}
              className="text-sm font-medium text-stone-600 hover:text-charcoal uppercase tracking-wide transition-colors"
            >
              <T>Puzzels</T>
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Language selector */}
            <select
              value={locale.language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
              className="text-sm font-medium text-stone-600 border-none bg-transparent cursor-pointer focus:ring-0 focus:outline-none"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Cart button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-stone-600 hover:text-charcoal transition-colors"
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
                <span className="absolute -top-1 -right-1 bg-ochre-500 text-charcoal text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
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
