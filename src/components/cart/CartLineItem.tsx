import { useCart, useLocale } from "~/contexts";
import type { CartLine } from "~/contexts/CartContext";

interface CartLineItemProps {
  item: CartLine;
}

/**
 * CartLineItem component
 *
 * Single line item in the cart with quantity controls.
 */
export function CartLineItem({ item }: CartLineItemProps) {
  const { updateItem, removeItem, isLoading } = useCart();
  const { formatPrice } = useLocale();

  return (
    <div className="flex gap-4 py-4 border-b border-cream-200">
      {/* Product image */}
      <div className="w-20 h-20 bg-cream-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.merchandise.product.featuredImage ? (
          <img
            src={item.merchandise.product.featuredImage.url}
            alt={item.merchandise.product.featuredImage.altText ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
            No image
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-charcoal truncate">
          {item.merchandise.product.title}
        </h3>
        <p className="text-stone-500 text-sm">
          {item.merchandise.title}
        </p>

        {/* Line item properties (personalization) */}
        {item.attributes && item.attributes.length > 0 && (
          <div className="mt-1 text-xs text-stone-400">
            {item.attributes.map((attr, index) => (
              <span key={index}>
                {attr.key}: {attr.value}
                {index < item.attributes.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}

        <p className="font-display text-ochre-700 font-semibold mt-1">
          {formatPrice(parseFloat(item.merchandise.price.amount))}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => updateItem(item.id, item.quantity - 1)}
            disabled={isLoading}
            className="w-7 h-7 rounded border border-stone-300 text-stone-600 hover:bg-cream-100 hover:border-ochre-400 disabled:opacity-50 flex items-center justify-center transition-colors"
            aria-label="Decrease quantity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => updateItem(item.id, item.quantity + 1)}
            disabled={isLoading}
            className="w-7 h-7 rounded border border-stone-300 text-stone-600 hover:bg-cream-100 hover:border-ochre-400 disabled:opacity-50 flex items-center justify-center transition-colors"
            aria-label="Increase quantity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => removeItem(item.id)}
            disabled={isLoading}
            className="ml-auto text-burgundy-700 hover:text-burgundy-900 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
