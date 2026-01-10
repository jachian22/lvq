import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import Cookies from "js-cookie";
import type { CountryCode, LanguageCode, CurrencyCode } from "~/server/shopify";

/**
 * Locale configuration
 */
export interface LocaleConfig {
  country: CountryCode;
  language: LanguageCode;
  currency: CurrencyCode;
}

/**
 * Context value type
 */
interface LocaleContextValue {
  locale: LocaleConfig;
  setCountry: (country: CountryCode) => void;
  setLanguage: (language: LanguageCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amount: number) => string;
}

/**
 * Default locale configuration
 */
const defaultLocale: LocaleConfig = {
  country: "NL",
  language: "NL",
  currency: "EUR",
};

/**
 * Country to currency mapping
 */
const countryCurrencyMap: Record<CountryCode, CurrencyCode> = {
  NL: "EUR",
  DE: "EUR",
  FR: "EUR",
  BE: "EUR",
  AT: "EUR",
  IT: "EUR",
  ES: "EUR",
  PT: "EUR",
  IE: "EUR",
  LU: "EUR",
  GB: "GBP",
  US: "USD",
};

/**
 * Currency format configurations
 */
const currencyFormats: Record<CurrencyCode, { locale: string; symbol: string }> = {
  EUR: { locale: "nl-NL", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
  USD: { locale: "en-US", symbol: "$" },
};

/**
 * Cookie names
 */
const COOKIE_COUNTRY = "lvq_country";
const COOKIE_LANGUAGE = "lvq_language";
const COOKIE_CURRENCY = "lvq_currency";
const COOKIE_EXPIRES = 365; // days

/**
 * Auto-detect currency from browser locale
 * US visitors get USD, everyone else gets EUR (EU-focused business)
 */
function detectCurrencyFromBrowser(): CurrencyCode {
  if (typeof window === "undefined") return "EUR";

  const browserLocale = navigator.language; // e.g., "en-US", "nl-NL", "de-DE"

  // US visitors get USD
  if (browserLocale === "en-US" || browserLocale.endsWith("-US")) {
    return "USD";
  }

  // Default to EUR for everyone else (EU-focused business)
  return "EUR";
}

/**
 * Create the context
 */
const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * LocaleProvider component
 */
export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Partial<LocaleConfig>;
}) {
  // Initialize with default values for consistent SSR hydration
  const [locale, setLocale] = useState<LocaleConfig>({
    country: initialLocale?.country ?? defaultLocale.country,
    language: initialLocale?.language ?? defaultLocale.language,
    currency: initialLocale?.currency ?? defaultLocale.currency,
  });

  // After hydration, load from cookies or detect from browser
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    if (isHydrated) return;
    setIsHydrated(true);

    const savedCountry = Cookies.get(COOKIE_COUNTRY) as CountryCode | undefined;
    const savedLanguage = Cookies.get(COOKIE_LANGUAGE) as LanguageCode | undefined;
    const savedCurrency = Cookies.get(COOKIE_CURRENCY) as CurrencyCode | undefined;

    // Auto-detect currency from browser if not saved
    const detectedCurrency = savedCurrency ?? detectCurrencyFromBrowser();

    setLocale({
      country: savedCountry ?? initialLocale?.country ?? defaultLocale.country,
      language: savedLanguage ?? initialLocale?.language ?? defaultLocale.language,
      currency: detectedCurrency,
    });
  }, [isHydrated, initialLocale]);

  // Persist to cookies when locale changes
  useEffect(() => {
    Cookies.set(COOKIE_COUNTRY, locale.country, { expires: COOKIE_EXPIRES });
    Cookies.set(COOKIE_LANGUAGE, locale.language, { expires: COOKIE_EXPIRES });
    Cookies.set(COOKIE_CURRENCY, locale.currency, { expires: COOKIE_EXPIRES });
  }, [locale]);

  // Set country (also updates currency to match)
  const setCountry = useCallback((country: CountryCode) => {
    setLocale((prev) => ({
      ...prev,
      country,
      currency: countryCurrencyMap[country],
    }));
  }, []);

  // Set language
  const setLanguage = useCallback((language: LanguageCode) => {
    setLocale((prev) => ({
      ...prev,
      language,
    }));
  }, []);

  // Set currency (override automatic from country)
  const setCurrency = useCallback((currency: CurrencyCode) => {
    setLocale((prev) => ({
      ...prev,
      currency,
    }));
  }, []);

  // Format price according to current currency
  const formatPrice = useCallback(
    (amount: number) => {
      const format = currencyFormats[locale.currency];
      return new Intl.NumberFormat(format.locale, {
        style: "currency",
        currency: locale.currency,
      }).format(amount);
    },
    [locale.currency]
  );

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setCountry,
        setLanguage,
        setCurrency,
        formatPrice,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to access locale context
 */
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

/**
 * Get supported countries
 */
export const supportedCountries: Array<{ code: CountryCode; name: string }> = [
  { code: "NL", name: "Netherlands" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgium" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "AT", name: "Austria" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "IE", name: "Ireland" },
  { code: "LU", name: "Luxembourg" },
];

/**
 * Get supported languages
 */
export const supportedLanguages: Array<{ code: LanguageCode; name: string }> = [
  { code: "NL", name: "Nederlands" },
  { code: "EN", name: "English" },
  { code: "DE", name: "Deutsch" },
  { code: "FR", name: "Français" },
];

/**
 * Get supported currencies
 */
export const supportedCurrencies: Array<{ code: CurrencyCode; name: string; symbol: string }> = [
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "USD", name: "US Dollar", symbol: "$" },
];
