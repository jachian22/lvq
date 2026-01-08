import Link from "next/link";

/**
 * Footer component
 *
 * Site footer with links and company info.
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              La <span className="text-red-500">Vistique</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Transform your beloved pets into stunning royal portraits.
              Hand-crafted by our talented artists.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-semibold">Shop</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/collections/royal-portraits" className="hover:text-white transition-colors">
                  Royal Portraits
                </Link>
              </li>
              <li>
                <Link href="/collections/military" className="hover:text-white transition-colors">
                  Military
                </Link>
              </li>
              <li>
                <Link href="/collections/renaissance" className="hover:text-white transition-colors">
                  Renaissance
                </Link>
              </li>
              <li>
                <Link href="/collections/couples" className="hover:text-white transition-colors">
                  Couples
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/pages/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/pages/returns" className="hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold">Stay Updated</h4>
            <p className="text-gray-400 text-sm">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} La Vistique. All rights reserved.
          </p>
          <div className="flex gap-4 text-gray-400 text-sm">
            <Link href="/pages/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/pages/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
