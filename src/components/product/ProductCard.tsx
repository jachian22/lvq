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
      <div className="aspect-square bg-cream-100 rounded-lg overflow-hidden relative ring-2 ring-transparent transition-all duration-300 ease-regal group-hover:ring-ochre-300 group-hover:shadow-gold group-hover:-translate-y-1">
        {product.featuredImage ? (
          <>
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-regal group-hover:scale-105"
            />
            {/* Portrait vignette overlay on hover */}
            <div className="absolute inset-0 pointer-events-none transition-shadow duration-500 ease-regal group-hover:shadow-[inset_0_0_60px_rgba(28,25,23,0.25)]" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Sale badge (from Shopify compare at price) */}
        {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
          <div className="absolute top-3 right-3 bg-burgundy-800 text-cream-100 text-xs font-semibold px-2.5 py-1 rounded uppercase tracking-wide">
            Sale
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className="font-display text-lg font-semibold text-charcoal group-hover:text-ochre-600 transition-colors duration-200">
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
