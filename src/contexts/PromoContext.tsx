import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import Cookies from "js-cookie";
import { api } from "~/utils/api";

/**
 * Promo code information
 */
export interface PromoCode {
  code: string;
  title: string;
  type: "percentage" | "fixed_amount";
  value: number;
  appliesTo: "all" | "collection" | "product";
  targetIds: string[] | null;
  targetName: string | null;
  endsAt: Date | null;
}

/**
 * Discount calculation result
 */
export interface DiscountResult {
  original: number;
  discounted: number;
  savings: number;
  percentage: number;
  qualifies: boolean;
}

/**
 * Context value type
 */
interface PromoContextValue {
  activePromo: PromoCode | null;
  isLoading: boolean;
  error: string | null;
  applyPromo: (code: string) => Promise<boolean>;
  clearPromo: () => void;
  calculateDiscount: (price: number, productId: string, collectionIds: string[]) => DiscountResult;
}

/**
 * Cookie configuration
 */
const COOKIE_PROMO = "lvq_promo";
const COOKIE_EXPIRES = 30; // days

/**
 * Create the context
 */
const PromoContext = createContext<PromoContextValue | null>(null);

/**
 * PromoProvider component
 */
export function PromoProvider({
  children,
  initialPromoCode,
}: {
  children: ReactNode;
  initialPromoCode?: string;
}) {
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tRPC query for validating promo codes
  const validatePromoMutation = api.discounts.getByCode.useQuery(
    { code: activePromo?.code ?? "" },
    { enabled: false }
  );

  // Initialize from URL param or cookie on mount
  useEffect(() => {
    const initPromo = async () => {
      // Check URL for promo code first
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlPromo = urlParams.get("promo");

        if (urlPromo) {
          // Remove promo from URL without reload
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("promo");
          window.history.replaceState({}, "", newUrl.toString());

          // Apply the promo
          await applyPromoInternal(urlPromo);
          return;
        }

        // Check cookie for existing promo
        const savedPromo = Cookies.get(COOKIE_PROMO);
        if (savedPromo) {
          await applyPromoInternal(savedPromo);
        } else if (initialPromoCode) {
          await applyPromoInternal(initialPromoCode);
        }
      }
    };

    initPromo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Internal apply function
  const applyPromoInternal = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate with API
      const result = await validatePromoMutation.refetch();
      const promo = result.data;

      if (!promo) {
        setError("Invalid or expired promo code");
        setActivePromo(null);
        Cookies.remove(COOKIE_PROMO);
        return false;
      }

      // Check if expired
      if (promo.endsAt && new Date(promo.endsAt) < new Date()) {
        setError("This promo code has expired");
        setActivePromo(null);
        Cookies.remove(COOKIE_PROMO);
        return false;
      }

      // Set active promo
      setActivePromo(promo);
      Cookies.set(COOKIE_PROMO, code.toUpperCase(), { expires: COOKIE_EXPIRES });
      return true;
    } catch {
      setError("Failed to validate promo code");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Apply promo code
  const applyPromo = useCallback(async (code: string): Promise<boolean> => {
    return applyPromoInternal(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear promo
  const clearPromo = useCallback(() => {
    setActivePromo(null);
    setError(null);
    Cookies.remove(COOKIE_PROMO);
  }, []);

  // Calculate discount for a product
  const calculateDiscount = useCallback(
    (price: number, productId: string, collectionIds: string[]): DiscountResult => {
      // No discount result
      const noDiscount: DiscountResult = {
        original: price,
        discounted: price,
        savings: 0,
        percentage: 0,
        qualifies: false,
      };

      if (!activePromo) {
        return noDiscount;
      }

      // Check if this product qualifies
      let qualifies = false;

      switch (activePromo.appliesTo) {
        case "all":
          qualifies = true;
          break;
        case "collection":
          qualifies = activePromo.targetIds
            ? collectionIds.some((id) => activePromo.targetIds!.includes(id))
            : false;
          break;
        case "product":
          qualifies = activePromo.targetIds
            ? activePromo.targetIds.includes(productId)
            : false;
          break;
      }

      if (!qualifies) {
        return noDiscount;
      }

      // Calculate discount
      let discounted: number;
      let percentage: number;

      if (activePromo.type === "percentage") {
        percentage = activePromo.value;
        discounted = Math.round(price * (1 - activePromo.value / 100) * 100) / 100;
      } else {
        // Fixed amount discount
        discounted = Math.max(0, price - activePromo.value);
        percentage = Math.round(((price - discounted) / price) * 100);
      }

      return {
        original: price,
        discounted,
        savings: price - discounted,
        percentage,
        qualifies: true,
      };
    },
    [activePromo]
  );

  return (
    <PromoContext.Provider
      value={{
        activePromo,
        isLoading,
        error,
        applyPromo,
        clearPromo,
        calculateDiscount,
      }}
    >
      {children}
    </PromoContext.Provider>
  );
}

/**
 * Hook to access promo context
 */
export function usePromo() {
  const context = useContext(PromoContext);
  if (!context) {
    throw new Error("usePromo must be used within a PromoProvider");
  }
  return context;
}
