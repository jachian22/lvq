import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import Cookies from "js-cookie";
import { api } from "~/utils/api";
import { useLocale } from "./LocaleContext";
import { usePromo } from "./PromoContext";

/**
 * Cart line item (simplified from Shopify response)
 */
export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: {
        url: string;
        altText: string | null;
      } | null;
    };
    price: {
      amount: string;
      currencyCode: string;
    };
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  };
  attributes: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Cart state
 */
export interface CartState {
  id: string | null;
  checkoutUrl: string | null;
  totalQuantity: number;
  lines: CartLineItem[];
  subtotal: {
    amount: string;
    currencyCode: string;
  } | null;
  total: {
    amount: string;
    currencyCode: string;
  } | null;
  discountCodes: Array<{
    code: string;
    applicable: boolean;
  }>;
}

/**
 * Export CartLine type alias for components
 */
export type CartLine = CartLineItem;

/**
 * Context value type
 */
interface CartContextValue {
  cart: CartState;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    merchandiseId: string,
    quantity: number,
    attributes?: Array<{ key: string; value: string }>
  ) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  addSkipTheLine: () => Promise<void>;
  goToCheckout: () => void;
}

/**
 * Cookie configuration
 */
const COOKIE_CART_ID = "lvq_cart_id";
const COOKIE_EXPIRES = 30; // days

/**
 * Empty cart state
 */
const emptyCart: CartState = {
  id: null,
  checkoutUrl: null,
  totalQuantity: 0,
  lines: [],
  subtotal: null,
  total: null,
  discountCodes: [],
};

/**
 * Create the context
 */
const CartContext = createContext<CartContextValue | null>(null);

/**
 * CartProvider component
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(emptyCart);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { locale } = useLocale();
  const { activePromo } = usePromo();

  // tRPC mutations
  const createCartMutation = api.cart.create.useMutation();
  const getCartQuery = api.cart.get.useQuery(
    { cartId: cart.id ?? "", locale: { country: locale.country, language: locale.language } },
    { enabled: false }
  );
  const addLinesMutation = api.cart.addLines.useMutation();
  const updateLinesMutation = api.cart.updateLines.useMutation();
  const removeLinesMutation = api.cart.removeLines.useMutation();
  const updateDiscountMutation = api.cart.updateDiscountCodes.useMutation();

  // Transform Shopify cart response to our CartState
  const transformCart = (shopifyCart: NonNullable<typeof getCartQuery.data>): CartState => ({
    id: shopifyCart.id,
    checkoutUrl: shopifyCart.checkoutUrl,
    totalQuantity: shopifyCart.totalQuantity,
    lines: shopifyCart.lines.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      merchandise: {
        id: line.merchandise.id,
        title: line.merchandise.title,
        product: line.merchandise.product,
        price: line.merchandise.price,
        selectedOptions: line.merchandise.selectedOptions,
      },
      attributes: line.attributes,
    })),
    subtotal: shopifyCart.cost.subtotalAmount,
    total: shopifyCart.cost.totalAmount,
    discountCodes: shopifyCart.discountCodes,
  });

  // Load cart from cookie on mount
  useEffect(() => {
    const loadCart = async () => {
      const savedCartId = Cookies.get(COOKIE_CART_ID);
      if (savedCartId) {
        setIsLoading(true);
        try {
          const result = await getCartQuery.refetch();
          if (result.data) {
            setCart(transformCart(result.data));
          } else {
            // Cart not found or expired
            Cookies.remove(COOKIE_CART_ID);
          }
        } catch {
          Cookies.remove(COOKIE_CART_ID);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (typeof window !== "undefined") {
      loadCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply promo code when it changes
  useEffect(() => {
    if (cart.id && activePromo) {
      applyDiscount(activePromo.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePromo?.code]);

  // Cart drawer controls
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Add item to cart
  const addItem = useCallback(
    async (
      merchandiseId: string,
      quantity: number,
      attributes?: Array<{ key: string; value: string }>
    ) => {
      setIsLoading(true);
      try {
        let cartId = cart.id;

        // Create cart if doesn't exist
        if (!cartId) {
          const discountCodes = activePromo ? [activePromo.code] : undefined;
          const newCart = await createCartMutation.mutateAsync({
            lines: [{ merchandiseId, quantity, attributes }],
            discountCodes,
            locale: { country: locale.country, language: locale.language },
          });
          setCart(transformCart(newCart));
          Cookies.set(COOKIE_CART_ID, newCart.id, { expires: COOKIE_EXPIRES });
          openCart();
          return;
        }

        // Add to existing cart
        const updatedCart = await addLinesMutation.mutateAsync({
          cartId,
          lines: [{ merchandiseId, quantity, attributes }],
          locale: { country: locale.country, language: locale.language },
        });
        setCart(transformCart(updatedCart));
        openCart();
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id, activePromo, locale, createCartMutation, addLinesMutation, openCart]
  );

  // Update item quantity
  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart.id) return;

      setIsLoading(true);
      try {
        if (quantity === 0) {
          // Remove item
          await removeItem(lineId);
          return;
        }

        const updatedCart = await updateLinesMutation.mutateAsync({
          cartId: cart.id,
          lines: [{ id: lineId, quantity }],
          locale: { country: locale.country, language: locale.language },
        });
        setCart(transformCart(updatedCart));
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id, locale, updateLinesMutation]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart.id) return;

      setIsLoading(true);
      try {
        const updatedCart = await removeLinesMutation.mutateAsync({
          cartId: cart.id,
          lineIds: [lineId],
          locale: { country: locale.country, language: locale.language },
        });
        setCart(transformCart(updatedCart));
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id, locale, removeLinesMutation]
  );

  // Apply discount code
  const applyDiscount = useCallback(
    async (code: string) => {
      if (!cart.id) return;

      setIsLoading(true);
      try {
        const updatedCart = await updateDiscountMutation.mutateAsync({
          cartId: cart.id,
          discountCodes: [code],
          locale: { country: locale.country, language: locale.language },
        });
        setCart(transformCart(updatedCart));
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id, locale, updateDiscountMutation]
  );

  // Add Skip the Line product
  const addSkipTheLine = useCallback(async () => {
    // The Skip the Line product variant ID should come from Shopify
    // This is a placeholder - replace with actual variant ID
    const SKIP_THE_LINE_VARIANT_ID = "gid://shopify/ProductVariant/skip-the-line";
    await addItem(SKIP_THE_LINE_VARIANT_ID, 1);
  }, [addItem]);

  // Navigate to checkout
  const goToCheckout = useCallback(() => {
    if (cart.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  }, [cart.checkoutUrl]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateItem,
        removeItem,
        applyDiscount,
        addSkipTheLine,
        goToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
