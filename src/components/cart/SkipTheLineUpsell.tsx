import { useState } from "react";
import { useCart, useLocale } from "~/contexts";

/**
 * SkipTheLineUpsell component
 *
 * Upsell widget in cart offering priority processing for faster delivery.
 */
export function SkipTheLineUpsell() {
  const { cart, addSkipTheLine, isLoading } = useCart();
  const { formatPrice } = useLocale();
  const [isAdding, setIsAdding] = useState(false);

  // Check if Skip the Line is already in cart
  const hasSkipTheLine = cart.lines.some((line) =>
    line.merchandise.product.title.toLowerCase().includes("skip the line") ||
    line.merchandise.product.handle.includes("skip-the-line")
  );

  if (hasSkipTheLine) {
    return null;
  }

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await addSkipTheLine();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-ochre-50 to-warning-50 border border-ochre-200 rounded-lg p-5 my-4 shadow-gold">
      <div className="flex items-start gap-4">
        <div className="text-2xl">⚡</div>
        <div className="flex-1">
          <h4 className="font-display font-semibold text-charcoal">
            Skip the Line
          </h4>
          <p className="text-sm text-stone-600 mt-1">
            Get your portrait faster! Priority processing moves your order to the front of the queue.
          </p>
          <ul className="text-xs text-stone-500 mt-3 space-y-1.5">
            <li className="flex items-center gap-1.5">
              <span className="text-success-600">✓</span>
              Priority artist assignment
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-success-600">✓</span>
              Faster preview delivery
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-success-600">✓</span>
              Express shipping included
            </li>
          </ul>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-xl text-ochre-700">{formatPrice(29.99)}</p>
          <button
            onClick={handleAdd}
            disabled={isLoading || isAdding}
            className="mt-3 px-5 py-2 bg-ochre-500 text-charcoal text-sm font-semibold rounded-lg hover:bg-ochre-600 hover:shadow-gold transition-all duration-200 disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
