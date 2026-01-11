import Link from "next/link";
import { T } from "gt-react";
import { useLocale } from "~/contexts/LocaleContext";

/**
 * Footer component
 *
 * Site footer with links and company info.
 * Design: Dark stone background, cream text, ochre accents.
 */
export function Footer() {
  const { locale } = useLocale();
  const localePrefix = `/${locale.language.toLowerCase()}`;

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <h3 className="font-display text-2xl font-bold text-cream-100 tracking-tight">
              La <span className="text-ochre-500">Vistique</span>
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              <T>Transformeer je geliefde huisdieren in prachtige koninklijke portretten. Met de hand gemaakt door onze getalenteerde kunstenaars.</T>
            </p>
            {/* Social Links with hover effects */}
            <div className="flex gap-4 pt-2">
              <a
                href="https://instagram.com/lavistique"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream-100 hover:scale-110 hover:-translate-y-0.5 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/lavistique"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-cream-100 hover:scale-110 hover:-translate-y-0.5 transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-cream-100 uppercase tracking-wider">
              <T>Shop</T>
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`${localePrefix}/collections/pet`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Portretten</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/collections/illustration`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Illustraties</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/collections/pet-jigsaw-puzzle`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Puzzels</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/products/lavistique-gift-card`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Cadeaubonnen</T>
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-cream-100 uppercase tracking-wider">
              <T>Hulp</T>
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`${localePrefix}/pages/how-it-works`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Hoe het werkt</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/pages/frequently-asked-questions`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Veelgestelde vragen</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/pages/photo-guidelines`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Foto richtlijnen</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/pages/contact`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Contact</T>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-cream-100 uppercase tracking-wider">
              <T>Bedrijf</T>
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`${localePrefix}/pages/about-us`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Over ons</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/pages/reviews`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Recensies</T>
                </Link>
              </li>
              <li>
                <Link href={`${localePrefix}/blogs`} className="text-stone-400 hover:text-cream-100 transition-colors inline-block hover:translate-x-1 duration-200">
                  <T>Blog</T>
                </Link>
              </li>
            </ul>
            {/* Contact Info */}
            <div className="pt-2 space-y-2 text-sm text-stone-400">
              <p>Osloweg 57, Groningen, NL</p>
              <a href="mailto:service@lavistique.com" className="hover:text-cream-100 transition-colors">
                service@lavistique.com
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-cream-100 uppercase tracking-wider">
              <T>Blijf op de hoogte</T>
            </h4>
            <p className="text-stone-400 text-sm">
              <T>Schrijf je in voor exclusieve aanbiedingen en nieuwe producten.</T>
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Je e-mailadres"
                className="flex-1 px-4 py-2.5 rounded-md bg-stone-800 text-cream-100 placeholder-stone-500 text-sm border border-stone-700 focus:outline-none focus:ring-2 focus:ring-ochre-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-ochre-500 text-charcoal rounded-md hover:bg-ochre-600 hover:shadow-gold transition-all duration-200 text-sm font-semibold tracking-wide hover:scale-105 active:scale-95"
              >
                <T>Inschrijven</T>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} La Vistique. <T>Alle rechten voorbehouden.</T>
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-stone-500 text-sm">
            <Link href={`${localePrefix}/policies/shipping-policy`} className="hover:text-cream-100 transition-colors">
              <T>Verzending</T>
            </Link>
            <Link href={`${localePrefix}/policies/refund-policy`} className="hover:text-cream-100 transition-colors">
              <T>Retouren</T>
            </Link>
            <Link href={`${localePrefix}/policies/privacy-policy`} className="hover:text-cream-100 transition-colors">
              <T>Privacy</T>
            </Link>
            <Link href={`${localePrefix}/policies/terms-of-service`} className="hover:text-cream-100 transition-colors">
              <T>Voorwaarden</T>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
