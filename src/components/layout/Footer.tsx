import Link from "next/link";

/**
 * Footer component
 *
 * Site footer with links and company info.
 * Design: Dark stone background, cream text, ochre accents.
 */
export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-cream-100 tracking-tight">
              La <span className="text-ochre-500">Vistique</span>
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Transform your beloved pets into stunning royal portraits.
              Hand-crafted by our talented artists.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/collections/royal-portraits" className="text-stone-400 hover:text-cream-100 transition-colors">
                  Royal Portraits
                </Link>
              </li>
              <li>
                <Link href="/collections/military" className="text-stone-400 hover:text-cream-100 transition-colors">
                  Military
                </Link>
              </li>
              <li>
                <Link href="/collections/renaissance" className="text-stone-400 hover:text-cream-100 transition-colors">
                  Renaissance
                </Link>
              </li>
              <li>
                <Link href="/collections/couples" className="text-stone-400 hover:text-cream-100 transition-colors">
                  Couples
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/pages/faq" className="text-stone-400 hover:text-cream-100 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping" className="text-stone-400 hover:text-cream-100 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/pages/returns" className="text-stone-400 hover:text-cream-100 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="text-stone-400 hover:text-cream-100 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-stone-400 text-sm">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-md bg-stone-800 text-cream-100 placeholder-stone-500 text-sm border border-stone-700 focus:outline-none focus:ring-2 focus:ring-ochre-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-ochre-500 text-charcoal rounded-md hover:bg-ochre-600 transition-colors text-sm font-semibold tracking-wide"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} La Vistique. All rights reserved.
          </p>
          <div className="flex gap-6 text-stone-500 text-sm">
            <Link href="/pages/privacy" className="hover:text-cream-100 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/pages/terms" className="hover:text-cream-100 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
