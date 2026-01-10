import { type AppType } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
 * Reads locale from URL path directly to avoid race conditions
 */
function TranslationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Extract locale from URL path directly (more reliable than context on first render)
  const pathSegment = router.asPath.split("/")[1]?.split("?")[0];
  const gtLocale = ["nl", "en", "de", "fr"].includes(pathSegment ?? "")
    ? pathSegment
    : "nl";

  return (
    <GTProvider
      projectId={process.env.NEXT_PUBLIC_GT_PROJECT_ID ?? ""}
      devApiKey={process.env.NEXT_PUBLIC_GT_DEV_API_KEY}
      locale={gtLocale!}
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

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <LocaleProvider>
      <LocaleSync>
        <TranslationProvider>
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
