import Head from "next/head";
import Link from "next/link";
import { type GetServerSideProps } from "next";
import { useCart, useLocale } from "~/contexts";
import { CartLineItem } from "~/components/cart/CartLineItem";
import { SkipTheLineUpsell } from "~/components/cart/SkipTheLineUpsell";

interface CartPageProps {
  locale: string;
}

/**
 * Cart page
 *
 * Full cart view with line items, upsells, and checkout.
 */
export default function CartPage({ locale }: CartPageProps) {
  const { cart, goToCheckout, isLoading } = useCart();
  const { formatPrice } = useLocale();

  return (
    <>
      <Head>
        <title>Your Cart - La Vistique</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

          {cart.lines.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300 mb-4"
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some beautiful portraits to get started!</p>
              <Link
                href={`/${locale}`}
                className="inline-block px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  {cart.lines.map((item) => (
                    <CartLineItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Skip the Line upsell */}
                <SkipTheLineUpsell />

                {/* Continue shopping */}
                <div className="mt-6">
                  <Link
                    href={`/${locale}`}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                  {/* Discount codes */}
                  {cart.discountCodes.length > 0 && (
                    <div className="flex items-center gap-2 text-sm mb-4 pb-4 border-b">
                      <span className="text-green-600">✓</span>
                      <span className="text-green-700 font-medium">
                        {cart.discountCodes.map((dc) => dc.code).join(", ")} applied
                      </span>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cart.totalQuantity} items)</span>
                      <span className="font-medium">
                        {cart.subtotal && formatPrice(parseFloat(cart.subtotal.amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold">
                        {cart.total && formatPrice(parseFloat(cart.total.amount))}
                      </span>
                    </div>
                  </div>

                  {/* Checkout button */}
                  <button
                    onClick={goToCheckout}
                    disabled={isLoading || !cart.checkoutUrl}
                    className="w-full mt-6 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Proceed to Checkout"}
                  </button>

                  {/* Trust badges */}
                  <div className="mt-6 pt-6 border-t space-y-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Secure checkout
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      100% Satisfaction guarantee
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                      Free worldwide shipping
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CartPageProps> = async (context) => {
  const locale = context.params?.locale as string;

  return {
    props: {
      locale,
    },
  };
};
