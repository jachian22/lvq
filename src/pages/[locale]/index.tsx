import Head from "next/head";
import Link from "next/link";
import { type GetServerSideProps } from "next";
import { api } from "~/utils/api";
import { ProductCard } from "~/components/product/ProductCard";

interface HomePageProps {
  locale: string;
}

/**
 * Homepage
 *
 * Shows featured collections and products.
 */
export default function HomePage({ locale }: HomePageProps) {
  // Fetch featured collections
  const collectionsQuery = api.storefront.getCollections.useQuery({
    first: 3,
  });

  // Fetch featured products
  const productsQuery = api.storefront.getProducts.useQuery({
    first: 8,
  });

  return (
    <>
      <Head>
        <title>La Vistique - Custom Pet Portraits</title>
        <meta name="description" content="Transform your pet into royalty with custom hand-painted portraits" />
      </Head>

      {/* Hero section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Pet Into{" "}
            <span className="text-red-500">Royalty</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Hand-crafted custom portraits that turn your beloved pets into majestic works of art.
            100% satisfaction guaranteed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/${locale}/collections/royal-portraits`}
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href={`/${locale}/pages/how-it-works`}
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Collections</h2>

          {collectionsQuery.isLoading ? (
            <div className="flex justify-center">
              <div className="animate-pulse text-gray-500">Loading collections...</div>
            </div>
          ) : collectionsQuery.data?.collections.length === 0 ? (
            <p className="text-center text-gray-500">No collections found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collectionsQuery.data?.collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/${locale}/collections/${collection.handle}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                    {collection.image ? (
                      <img
                        src={collection.image.url}
                        alt={collection.image.altText ?? collection.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold group-hover:text-red-600 transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Shop {collection.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Portraits</h2>

          {productsQuery.isLoading ? (
            <div className="flex justify-center">
              <div className="animate-pulse text-gray-500">Loading products...</div>
            </div>
          ) : productsQuery.data?.products.length === 0 ? (
            <p className="text-center text-gray-500">No products found</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {productsQuery.data?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href={`/${locale}/collections/all`}
              className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold">Hand-Crafted</h3>
              <p className="text-gray-600 text-sm mt-2">
                Each portrait is created by our talented artists with attention to detail.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">💯</div>
              <h3 className="text-lg font-semibold">100% Satisfaction</h3>
              <p className="text-gray-600 text-sm mt-2">
                Unlimited revisions until you love it, or your money back.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-lg font-semibold">Free Shipping</h3>
              <p className="text-gray-600 text-sm mt-2">
                Free worldwide shipping on all orders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const locale = context.params?.locale as string;

  // Validate locale
  const validLocales = ["nl", "en", "de", "fr"];
  if (!validLocales.includes(locale.toLowerCase())) {
    return {
      redirect: {
        destination: "/nl",
        permanent: false,
      },
    };
  }

  return {
    props: {
      locale,
    },
  };
};
