import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";
import { LocaleProvider, PromoProvider, CartProvider, WizardProvider } from "~/contexts";
import { PromoBanner } from "~/components/layout/PromoBanner";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { CartDrawer } from "~/components/cart/CartDrawer";
import { ChatWidget } from "~/components/chat/ChatWidget";

import "~/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <LocaleProvider>
      <PromoProvider>
        <CartProvider>
          <WizardProvider>
            <div className={`${geist.className} min-h-screen flex flex-col`}>
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
