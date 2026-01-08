import Link from "next/link";
import { useCart, useLocale, supportedLanguages, supportedCountries } from "~/contexts";

/**
 * Header component
 *
 * Main navigation header with cart, language, and currency selectors.
 */
export function Header() {
  const { cart, toggleCart } = useCart();
  const { locale, setLanguage, setCountry } = useLocale();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              La <span className="text-red-600">Vistique</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/collections/royal-portraits"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Royal Portraits
            </Link>
            <Link
              href="/collections/military"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Military
            </Link>
            <Link
              href="/collections/renaissance"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Renaissance
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Language selector */}
            <select
              value={locale.language}
              onChange={(e) => setLanguage(e.target.value as "NL" | "EN" | "DE" | "FR")}
              className="text-sm border-none bg-transparent cursor-pointer"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Country selector */}
            <select
              value={locale.country}
              onChange={(e) => setCountry(e.target.value as typeof locale.country)}
              className="hidden sm:block text-sm border-none bg-transparent cursor-pointer"
            >
              {supportedCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>

            {/* Cart button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cart.totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
