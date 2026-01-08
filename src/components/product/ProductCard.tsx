import Link from "next/link";
import { PriceDisplay } from "./PriceDisplay";
import type { Product, ProductSummary } from "~/server/shopify/types";

interface ProductCardProps {
  product: Product | ProductSummary;
  collectionHandle?: string;
}

/**
 * ProductCard component
 *
 * Displays a product in a grid with image, title, and price.
 * Uses PriceDisplay to show discounted prices when promo is active.
 */
export function ProductCard({ product, collectionHandle }: ProductCardProps) {
  const price = product.priceRange.minVariantPrice;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice;

  // Get collection IDs for discount calculation
  const collectionIds = product.collections?.edges?.map(
    (edge) => edge.node.id
  ) ?? [];

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block"
    >
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
        {product.featuredImage ? (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Sale badge (from Shopify compare at price) */}
        {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            Sale
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
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
