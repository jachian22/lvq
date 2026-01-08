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
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚡</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            Skip the Line
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Get your portrait faster! Priority processing moves your order to the front of the queue.
          </p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              Priority artist assignment
            </li>
            <li className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              Faster preview delivery
            </li>
            <li className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              Express shipping included
            </li>
          </ul>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{formatPrice(29.99)}</p>
          <button
            onClick={handleAdd}
            disabled={isLoading || isAdding}
            className="mt-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
