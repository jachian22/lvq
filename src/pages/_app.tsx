import { type AppType } from "next/app";
import { Playfair_Display, DM_Sans } from "next/font/google";

import { api } from "~/utils/api";
import { LocaleProvider, PromoProvider, CartProvider, WizardProvider } from "~/contexts";
import { PromoBanner } from "~/components/layout/PromoBanner";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { CartDrawer } from "~/components/cart/CartDrawer";
import { ChatWidget } from "~/components/chat/ChatWidget";

import "~/styles/globals.css";

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
    </LocaleProvider>
  );
};

export default api.withTRPC(MyApp);
