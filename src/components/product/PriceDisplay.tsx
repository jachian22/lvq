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
 * Design: Ochre gold for prices, burgundy badges for discounts.
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
      discounted: "font-display text-base font-semibold",
      badge: "text-xs px-1.5 py-0.5",
    },
    md: {
      original: "text-sm",
      discounted: "font-display text-xl font-bold",
      badge: "text-xs px-2 py-0.5",
    },
    lg: {
      original: "text-base",
      discounted: "font-display text-3xl font-bold",
      badge: "text-sm px-2.5 py-1",
    },
  };

  const classes = sizeClasses[size];

  // If promo is active and product qualifies
  if (activePromo && qualifies) {
    return (
      <div className={`flex flex-col gap-0.5 ${className}`}>
        <span className={`line-through text-stone-400 ${classes.original}`}>
          {formatPrice(original)}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-ochre-700 ${classes.discounted}`}>
            {formatPrice(discounted)}
          </span>
          <span
            className={`bg-burgundy-800 text-cream-100 rounded font-semibold uppercase tracking-wide ${classes.badge}`}
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
      <div className={`flex flex-col gap-0.5 ${className}`}>
        <span className={`line-through text-stone-400 ${classes.original}`}>
          {formatPrice(compareAtPrice)}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-ochre-700 ${classes.discounted}`}>
            {formatPrice(price)}
          </span>
          <span
            className={`bg-burgundy-800 text-cream-100 rounded font-semibold uppercase tracking-wide ${classes.badge}`}
          >
            -{salePercentage}%
          </span>
        </div>
      </div>
    );
  }

  // Regular price (no discount)
  return (
    <span className={`text-ochre-700 ${classes.discounted} ${className}`}>
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
  return <span className={`font-display ${className}`}>{formatPrice(amount)}</span>;
}
