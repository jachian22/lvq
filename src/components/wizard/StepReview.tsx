import { useState } from "react";
import { useWizard } from "~/contexts/WizardContext";
import { useCart } from "~/contexts/CartContext";
import { useLocale } from "~/contexts/LocaleContext";

/**
 * StepReview component
 *
 * Final wizard step: Review selections and add to cart.
 */
export function StepReview() {
  const { state, previousStep, canGoPrevious, getVariantId, getCartAttributes, reset } = useWizard();
  const { addItem, isLoading } = useCart();
  const { formatPrice } = useLocale();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    const variantId = getVariantId();
    if (!variantId) {
      console.error("No variant ID available");
      return;
    }

    setIsAddingToCart(true);
    try {
      const attributes = getCartAttributes();
      await addItem(variantId, 1, attributes);
      reset(); // Reset wizard after successful add
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-charcoal">Review Your Order</h2>
        <p className="mt-3 text-stone-600">
          Check your selections before adding to cart.
        </p>
      </div>

      {/* Review summary */}
      <div className="bg-cream-100 rounded-lg overflow-hidden border border-cream-300">
        {/* Photo preview */}
        {state.uploadedImageUrl && (
          <div className="p-6 bg-white border-b border-cream-200">
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-ochre-200 shadow-gold">
                <img
                  src={state.uploadedImageUrl}
                  alt="Your pet"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-charcoal">{state.productTitle}</h3>
                <p className="text-sm text-stone-500 mt-1">Custom pet portrait</p>
              </div>
            </div>
          </div>
        )}

        {/* Selections */}
        <div className="divide-y divide-cream-200">
          {/* Costume */}
          {state.selectedCostume && (
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-stone-500">Style</p>
                <p className="font-medium text-charcoal">{state.selectedCostume.label}</p>
              </div>
            </div>
          )}

          {/* Size */}
          {state.selectedSize && (
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-stone-500">Size</p>
                <p className="font-medium text-charcoal">
                  {state.selectedSize.label} ({state.selectedSize.dimensions})
                </p>
              </div>
              <p className="font-display font-semibold text-ochre-700">
                {formatPrice(state.selectedSize.price)}
              </p>
            </div>
          )}

          {/* Frame */}
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-stone-500">Frame</p>
              <p className="font-medium text-charcoal">
                {state.selectedFrame ? state.selectedFrame.label : "No frame (canvas only)"}
              </p>
            </div>
            {state.selectedFrame && (
              <p className="font-display font-semibold text-ochre-700">
                +{formatPrice(state.selectedFrame.price)}
              </p>
            )}
          </div>

          {/* Photo */}
          <div className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-stone-500">Photo</p>
              <p className="font-medium text-charcoal truncate max-w-[200px]">
                {state.uploadedImageName ?? "Not uploaded"}
              </p>
            </div>
            <span className="text-success-600 flex items-center text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Uploaded
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="p-5 bg-white border-t border-cream-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-charcoal">Total</span>
            <span className="font-display text-3xl font-bold text-ochre-700">
              {formatPrice(state.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Satisfaction guarantee */}
      <div className="bg-success-50 rounded-lg p-5 flex items-start gap-4 border border-success-200">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h4 className="font-display font-semibold text-success-800">100% Satisfaction Guarantee</h4>
          <p className="text-sm text-success-700 mt-1">
            We'll work on unlimited revisions until you love your portrait. If you're still not satisfied, we'll provide a full refund.
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={previousStep}
          disabled={!canGoPrevious() || isAddingToCart}
          className="px-6 py-3 text-stone-600 font-medium hover:text-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isLoading || isAddingToCart}
          className="btn-primary px-8 py-3 flex items-center gap-2"
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding to Cart...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
