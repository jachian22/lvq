import { useCart, useLocale } from "~/contexts";
import { SimplePrice } from "~/components/product/PriceDisplay";

/**
 * CartDrawer component
 *
 * Slide-out cart drawer showing cart contents and checkout button.
 */
export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, goToCheckout, isLoading } = useCart();
  const { formatPrice } = useLocale();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/60 z-40 transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream-50 shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cream-200 bg-white">
          <h2 className="font-display text-xl font-semibold text-charcoal">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 text-stone-400 hover:text-charcoal transition-colors"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart contents */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.lines.length === 0 ? (
            <div className="text-center py-16 animate-fade-in-up">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-stone-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="font-display text-lg text-stone-500">Your cart is empty</p>
              <p className="text-sm text-stone-400 mt-2">Add a custom portrait to get started</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.lines.map((item, index) => (
                <li
                  key={item.id}
                  className="flex gap-4 p-4 bg-white rounded-lg border border-cream-200 animate-fade-in-up hover:border-ochre-200 hover:shadow-sm transition-all duration-200"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  {/* Product image */}
                  <div className="w-20 h-20 bg-cream-100 rounded-lg overflow-hidden flex-shrink-0 group">
                    {item.merchandise.product.featuredImage ? (
                      <img
                        src={item.merchandise.product.featuredImage.url}
                        alt={item.merchandise.product.featuredImage.altText ?? ""}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
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
                    <p className="font-display text-ochre-700 font-semibold mt-1">
                      {formatPrice(parseFloat(item.merchandise.price.amount))}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        disabled={isLoading}
                        className="w-7 h-7 rounded border border-stone-300 text-stone-600 hover:bg-cream-100 hover:border-ochre-400 hover:scale-110 active:scale-95 disabled:opacity-50 transition-all duration-150"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        className="w-7 h-7 rounded border border-stone-300 text-stone-600 hover:bg-cream-100 hover:border-ochre-400 hover:scale-110 active:scale-95 disabled:opacity-50 transition-all duration-150"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isLoading}
                        className="ml-auto text-burgundy-700 hover:text-burgundy-900 text-sm font-medium disabled:opacity-50 transition-colors hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer with totals and checkout */}
        {cart.lines.length > 0 && (
          <div className="border-t border-cream-200 p-5 space-y-4 bg-white">
            {/* Discount codes */}
            {cart.discountCodes.length > 0 && (
              <div className="flex items-center gap-2 text-sm bg-success-50 p-3 rounded-lg">
                <span className="text-success-600">✓</span>
                <span className="text-success-700 font-medium">
                  {cart.discountCodes.map((dc) => dc.code).join(", ")} applied
                </span>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-display text-xl font-bold text-charcoal">
                {cart.subtotal && formatPrice(parseFloat(cart.subtotal.amount))}
              </span>
            </div>

            {/* Shipping note */}
            <p className="text-sm text-stone-500">
              Shipping calculated at checkout
            </p>

            {/* Checkout button with glow */}
            <button
              onClick={goToCheckout}
              disabled={isLoading || !cart.checkoutUrl}
              className="btn-primary w-full py-3.5 hover-glow"
            >
              {isLoading ? "Loading..." : "Checkout"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
