import { type AppType } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { GTProvider } from "gt-react";

import { api } from "~/utils/api";
import { LocaleProvider, PromoProvider, CartProvider, WizardProvider, useLocale } from "~/contexts";
import type { LanguageCode } from "~/server/shopify";
import { PromoBanner } from "~/components/layout/PromoBanner";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { CartDrawer } from "~/components/cart/CartDrawer";
import { ChatWidget } from "~/components/chat/ChatWidget";

import "~/styles/globals.css";

// Supported locales for validation
const SUPPORTED_LOCALES = ["nl", "en", "de", "fr"];

// Map our language codes to GT locale format
const languageToLocale: Record<string, string> = {
  NL: "nl",
  EN: "en",
  DE: "de",
  FR: "fr",
};

// Map URL locale to our uppercase language codes
const urlLocaleToLanguage: Record<string, LanguageCode> = {
  nl: "NL",
  en: "EN",
  de: "DE",
  fr: "FR",
};

/**
 * Syncs URL locale with LocaleContext
 */
function LocaleSync({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { locale, setLanguage } = useLocale();

  // Extract locale from URL path synchronously (works before router.isReady)
  const pathLocale = router.asPath.split("/")[1];
  const urlLanguage = pathLocale ? urlLocaleToLanguage[pathLocale] : undefined;

  // Sync URL locale to context
  useEffect(() => {
    if (urlLanguage && locale.language !== urlLanguage) {
      setLanguage(urlLanguage);
    }
  }, [urlLanguage, locale.language, setLanguage]);

  return <>{children}</>;
}

/**
 * Wrapper to connect GTProvider with our LocaleContext
 *
 * Priority chain for locale:
 * 1. serverLocale (from getServerSideProps) — SSR truth
 * 2. LocaleContext (after LocaleSync updates it)
 * 3. window.location.pathname — client fallback
 * 4. Default "nl"
 */
function TranslationProvider({
  children,
  serverLocale,
}: {
  children: React.ReactNode;
  serverLocale?: string;
}) {
  const { locale } = useLocale();

  const gtLocale = useMemo(() => {
    // 1. Server locale (during SSR and initial hydration)
    if (serverLocale && SUPPORTED_LOCALES.includes(serverLocale)) {
      return serverLocale;
    }

    // 2. Context (after LocaleSync updates it)
    const contextLocale = languageToLocale[locale.language];
    if (contextLocale) {
      return contextLocale;
    }

    // 3. Window location (client fallback)
    if (typeof window !== "undefined") {
      const pathLocale = window.location.pathname.split("/")[1];
      if (SUPPORTED_LOCALES.includes(pathLocale ?? "")) {
        return pathLocale;
      }
    }

    // 4. Default
    return "nl";
  }, [serverLocale, locale.language]);

  return (
    <GTProvider
      projectId={process.env.NEXT_PUBLIC_GT_PROJECT_ID ?? ""}
      devApiKey={process.env.NEXT_PUBLIC_GT_DEV_API_KEY}
      locale={gtLocale}
      defaultLocale="nl"
      locales={["nl", "en", "de", "fr"]}
    >
      {children}
    </GTProvider>
  );
}

// Display font: Elegant serif for headings and brand moments
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

// Body font: Clean geometric sans for UI and copy
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const MyApp: AppType<{ locale?: string }> = ({ Component, pageProps }) => {
  // Get locale from server (passed via getServerSideProps)
  const serverLocale = (pageProps as { locale?: string }).locale;

  return (
    <LocaleProvider serverLocale={serverLocale}>
      <LocaleSync>
        <TranslationProvider serverLocale={serverLocale}>
          <PromoProvider>
            <CartProvider>
              <WizardProvider>
                <div className={`${playfair.variable} ${dmSans.variable} min-h-screen flex flex-col bg-cream-50`}>
                  {/* Promo banner (when active) */}
                  <PromoBanner />

                  {/* Header with navigation */}
                  <Header />

                  {/* Main content */}
                  <main className="flex-1">
                    <Component {...pageProps} />
                  </main>

                  {/* Footer */}
                  <Footer />

                  {/* Cart drawer */}
                  <CartDrawer />

                  {/* Chat widget */}
                  <ChatWidget />
                </div>
              </WizardProvider>
            </CartProvider>
          </PromoProvider>
        </TranslationProvider>
      </LocaleSync>
    </LocaleProvider>
  );
};

export default api.withTRPC(MyApp);
