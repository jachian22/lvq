import { usePromo } from "~/contexts";
import { useLocale } from "~/contexts";

interface PriceDisplayProps {
  price: number;
  productId: string;
  collectionIds: string[];
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * PriceDisplay component
 *
 * Shows product prices with discount support.
 * When a promo code is active and applies to this product,
 * displays strikethrough original price with discounted price.
 */
export function PriceDisplay({
  price,
  productId,
  collectionIds,
  compareAtPrice,
  className = "",
  size = "md",
}: PriceDisplayProps) {
  const { activePromo, calculateDiscount } = usePromo();
  const { formatPrice } = useLocale();

  // Calculate discount
  const { original, discounted, percentage, qualifies } = calculateDiscount(
    price,
    productId,
    collectionIds
  );

  // Size-based classes
  const sizeClasses = {
    sm: {
      original: "text-sm",
      discounted: "text-base font-semibold",
      badge: "text-xs px-1 py-0.5",
    },
    md: {
      original: "text-sm",
      discounted: "text-lg font-bold",
      badge: "text-xs px-1.5 py-0.5",
    },
    lg: {
      original: "text-base",
      discounted: "text-2xl font-bold",
      badge: "text-sm px-2 py-1",
    },
  };

  const classes = sizeClasses[size];

  // If promo is active and product qualifies
  if (activePromo && qualifies) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`line-through text-gray-400 ${classes.original}`}>
          {formatPrice(original)}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-red-600 ${classes.discounted}`}>
            {formatPrice(discounted)}
          </span>
          <span
            className={`bg-red-100 text-red-700 rounded ${classes.badge}`}
          >
            -{percentage}%
          </span>
        </div>
      </div>
    );
  }

  // Check for compareAtPrice (sale price from Shopify)
  if (compareAtPrice && compareAtPrice > price) {
    const salePercentage = Math.round(
      ((compareAtPrice - price) / compareAtPrice) * 100
    );
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`line-through text-gray-400 ${classes.original}`}>
          {formatPrice(compareAtPrice)}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-red-600 ${classes.discounted}`}>
            {formatPrice(price)}
          </span>
          <span
            className={`bg-red-100 text-red-700 rounded ${classes.badge}`}
          >
            -{salePercentage}%
          </span>
        </div>
      </div>
    );
  }

  // Regular price (no discount)
  return (
    <span className={`${classes.discounted} ${className}`}>
      {formatPrice(price)}
    </span>
  );
}

/**
 * Simple price display without discount logic
 * Use for cart totals, etc.
 */
export function SimplePrice({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const { formatPrice } = useLocale();
  return <span className={className}>{formatPrice(amount)}</span>;
}
