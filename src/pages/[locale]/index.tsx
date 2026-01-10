import Head from "next/head";
import Link from "next/link";
import { type GetServerSideProps } from "next";
import { T } from "gt-react";
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
      <section className="bg-gradient-to-b from-stone-900 to-charcoal text-white py-24 relative overflow-hidden">
        {/* Subtle decorative frame corners */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-ochre-500/30 hidden md:block" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-ochre-500/30 hidden md:block" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-ochre-500/30 hidden md:block" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-ochre-500/30 hidden md:block" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-white">
            <T>Transformeer je huisdier in</T>{" "}
            <span className="text-ochre-500"><T>Royalty</T></span>
          </h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-10">
            <T>Handgemaakte portretten die je geliefde huisdieren omtoveren in majestueuze kunstwerken. 100% tevredenheid gegarandeerd.</T>
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/${locale}/collections/royal-portraits`}
              className="btn-primary px-8 py-3.5"
            >
              <T>Shop nu</T>
            </Link>
            <Link
              href={`/${locale}/pages/how-it-works`}
              className="btn-ghost px-8 py-3.5"
            >
              <T>Hoe het werkt</T>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <section className="py-20 bg-cream-100">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-charcoal mb-14">
            <T>Onze Collecties</T>
          </h2>

          {collectionsQuery.isLoading ? (
            <div className="flex justify-center">
              <div className="animate-pulse text-stone-500"><T>Collecties laden...</T></div>
            </div>
          ) : collectionsQuery.data?.collections.length === 0 ? (
            <p className="text-center text-stone-500"><T>Geen collecties gevonden</T></p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {collectionsQuery.data?.collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/${locale}/collections/${collection.handle}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] bg-cream-200 rounded-lg overflow-hidden ring-2 ring-transparent group-hover:ring-ochre-300 group-hover:shadow-gold transition-all duration-300 ease-regal">
                    {collection.image ? (
                      <img
                        src={collection.image.url}
                        alt={collection.image.altText ?? collection.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-regal"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <T>Geen afbeelding</T>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-charcoal group-hover:text-ochre-600 transition-colors duration-200">
                    {collection.title}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="py-20 bg-cream-50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-charcoal mb-14">
            <T>Populaire Portretten</T>
          </h2>

          {productsQuery.isLoading ? (
            <div className="flex justify-center">
              <div className="animate-pulse text-stone-500"><T>Producten laden...</T></div>
            </div>
          ) : productsQuery.data?.products.length === 0 ? (
            <p className="text-center text-stone-500"><T>Geen producten gevonden</T></p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {productsQuery.data?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-14">
            <Link
              href={`/${locale}/collections/all`}
              className="btn-ghost px-8 py-3.5"
            >
              <T>Bekijk alle producten</T>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-20 bg-cream-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="group">
              <div className="w-16 h-16 mx-auto bg-ochre-100 rounded-full flex items-center justify-center group-hover:bg-ochre-200 transition-colors duration-300">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mt-5">
                <T>Handgemaakt</T>
              </h3>
              <p className="text-stone-600 text-sm mt-2 max-w-xs mx-auto">
                <T>Elk portret wordt gemaakt door onze getalenteerde kunstenaars met oog voor detail.</T>
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto bg-ochre-100 rounded-full flex items-center justify-center group-hover:bg-ochre-200 transition-colors duration-300">
                <span className="text-3xl">💯</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mt-5">
                <T>100% Tevredenheid</T>
              </h3>
              <p className="text-stone-600 text-sm mt-2 max-w-xs mx-auto">
                <T>Onbeperkte revisies tot je het geweldig vindt, of je geld terug.</T>
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 mx-auto bg-ochre-100 rounded-full flex items-center justify-center group-hover:bg-ochre-200 transition-colors duration-300">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-charcoal mt-5">
                <T>Gratis verzending</T>
              </h3>
              <p className="text-stone-600 text-sm mt-2 max-w-xs mx-auto">
                <T>Gratis wereldwijde verzending op alle bestellingen.</T>
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
