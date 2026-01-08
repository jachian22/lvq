import { usePromo } from "~/contexts";

/**
 * PromoBanner component
 *
 * Displays a persistent banner at the top of the page when a promo code is active.
 * Shows different messages based on discount scope (all, collection, product).
 */
export function PromoBanner() {
  const { activePromo, clearPromo } = usePromo();

  if (!activePromo) {
    return null;
  }

  // Dynamic message based on discount scope
  const getMessage = () => {
    switch (activePromo.appliesTo) {
      case "all":
        return `${activePromo.value}% off your entire order!`;
      case "collection":
        return `${activePromo.value}% off ${activePromo.targetName ?? "selected items"}!`;
      case "product":
        return `${activePromo.value}% off selected products!`;
      default:
        return `${activePromo.value}% off!`;
    }
  };

  // Format end date if present
  const getExpiryText = () => {
    if (!activePromo.endsAt) return null;

    const endDate = new Date(activePromo.endsAt);
    const now = new Date();
    const hoursLeft = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    if (hoursLeft <= 24) {
      return `Ends in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`;
    }

    const daysLeft = Math.ceil(hoursLeft / 24);
    if (daysLeft <= 7) {
      return `Ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
    }

    return null;
  };

  const expiryText = getExpiryText();

  return (
    <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <span className="text-lg">🎉</span>
          <span>
            <strong>{activePromo.code}</strong> applied — {getMessage()}
          </span>
          {expiryText && (
            <span className="hidden sm:inline text-white/80 text-sm ml-2">
              ({expiryText})
            </span>
          )}
        </div>
        <button
          onClick={clearPromo}
          className="text-white/70 hover:text-white p-1 transition-colors"
          aria-label="Remove discount code"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
