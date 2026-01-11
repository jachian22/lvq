import Link from "next/link";
import { PriceDisplay } from "./PriceDisplay";
import { useLocale } from "~/contexts/LocaleContext";
import type { Product, ProductSummary } from "~/server/shopify/types";

interface ProductCardProps {
  product: Product | ProductSummary;
  collectionHandle?: string;
}

/**
 * ProductCard component
 *
 * Displays a product in a grid with image, title, and price.
 * Design: Interactive card with golden glow hover, portrait vignette effect.
 */
export function ProductCard({ product, collectionHandle }: ProductCardProps) {
  const { locale } = useLocale();
  const price = product.priceRange.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice;

  // Get collection IDs for discount calculation
  const collectionIds = product.collections?.edges?.map(
    (edge) => edge.node.id
  ) ?? [];

  // Get locale prefix for URL
  const localePrefix = locale.language.toLowerCase();

  return (
    <Link
      href={`/${localePrefix}/products/${product.handle}`}
      className="group block"
    >
      <div
        className="aspect-square bg-cream-100 rounded-lg overflow-hidden relative ring-2 ring-transparent transition-all duration-300 ease-regal group-hover:ring-ochre-300 group-hover:-translate-y-2"
        style={{
          boxShadow: "0 2px 8px -2px rgba(28, 25, 23, 0.08)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 4px 14px -2px rgba(233, 168, 54, 0.2), 0 8px 24px -4px rgba(28, 25, 23, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 8px -2px rgba(28, 25, 23, 0.08)";
        }}
      >
        {product.featuredImage ? (
          <>
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-regal group-hover:scale-105"
            />
            {/* Portrait vignette overlay on hover */}
            <div className="absolute inset-0 pointer-events-none transition-all duration-500 ease-regal opacity-0 group-hover:opacity-100 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent" />
            <div className="absolute inset-0 pointer-events-none transition-shadow duration-500 ease-regal group-hover:shadow-[inset_0_0_60px_rgba(28,25,23,0.25)]" />

            {/* Quick view overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 ease-regal">
                <svg className="w-5 h-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Sale badge with subtle animation */}
        {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
          <div className="absolute top-3 right-3 bg-burgundy-800 text-cream-100 text-xs font-semibold px-2.5 py-1 rounded uppercase tracking-wide shadow-md animate-bounce-in">
            Sale
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className="font-display text-lg font-semibold text-charcoal group-hover:text-ochre-600 transition-all duration-200 group-hover:tracking-tight">
          {product.title}
        </h3>

        <PriceDisplay
          price={parseFloat(price.amount)}
          productId={product.id}
          collectionIds={collectionIds}
          compareAtPrice={compareAtPrice ? parseFloat(compareAtPrice.amount) : null}
          size="sm"
        />
      </div>
    </Link>
  );
}
