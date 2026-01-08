import Head from "next/head";
import { type GetServerSideProps } from "next";
import { api } from "~/utils/api";
import { ProductCard } from "~/components/product/ProductCard";
import type { ProductSummary } from "~/server/shopify/types";

interface CollectionPageProps {
  locale: string;
  handle: string;
}

/**
 * Collection page
 *
 * Shows all products in a collection.
 */
export default function CollectionPage({ locale, handle }: CollectionPageProps) {
  // Fetch collection data
  const collectionQuery = api.storefront.getCollection.useQuery({
    handle,
    productsFirst: 24,
  });

  if (collectionQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading collection...</div>
      </div>
    );
  }

  if (collectionQuery.error || !collectionQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Collection not found</h1>
          <p className="text-gray-600 mt-2">The collection you're looking for doesn't exist.</p>
          <a
            href={`/${locale}`}
            className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const collection = collectionQuery.data;
  const products = collection.products.edges.map((edge: { node: ProductSummary }) => edge.node);

  return (
    <>
      <Head>
        <title>{collection.title} - La Vistique</title>
        <meta name="description" content={collection.description?.substring(0, 160) ?? `Shop ${collection.title} at La Vistique`} />
      </Head>

      <div className="min-h-screen">
        {/* Collection header */}
        <div className="relative bg-gray-900 text-white py-16">
          {collection.image && (
            <div className="absolute inset-0 opacity-30">
              <img
                src={collection.image.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="container mx-auto px-4 relative">
            <nav className="text-sm text-gray-400 mb-4">
              <a href={`/${locale}`} className="hover:text-white">Home</a>
              <span className="mx-2">/</span>
              <span className="text-white">{collection.title}</span>
            </nav>
            <h1 className="text-4xl font-bold">{collection.title}</h1>
            {collection.description && (
              <p className="mt-4 text-gray-300 max-w-2xl">{collection.description}</p>
            )}
          </div>
        </div>

        {/* Products grid */}
        <div className="container mx-auto px-4 py-12">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No products in this collection yet.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    collectionHandle={handle}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CollectionPageProps> = async (context) => {
  const locale = context.params?.locale as string;
  const handle = context.params?.handle as string;

  return {
    props: {
      locale,
      handle,
    },
  };
};
