import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { type GetServerSideProps } from "next";
import { api } from "~/utils/api";
import { useWizard, type CostumeOption, type SizeOption, type FrameOption } from "~/contexts/WizardContext";
import { WizardContainer } from "~/components/wizard/WizardContainer";

interface ProductPageProps {
  locale: string;
  handle: string;
}

// Sample costume options (these would come from product metafields in production)
const sampleCostumes: CostumeOption[] = [
  { id: "royal-king", label: "Royal King", imageUrl: "/costumes/royal-king.jpg" },
  { id: "royal-queen", label: "Royal Queen", imageUrl: "/costumes/royal-queen.jpg" },
  { id: "general", label: "General", imageUrl: "/costumes/general.jpg" },
  { id: "duke", label: "Duke", imageUrl: "/costumes/duke.jpg" },
  { id: "renaissance", label: "Renaissance", imageUrl: "/costumes/renaissance.jpg" },
  { id: "victorian", label: "Victorian", imageUrl: "/costumes/victorian.jpg" },
];

// Sample size options
const sampleSizes: SizeOption[] = [
  { id: "small", label: "Small", dimensions: "8\" x 10\"", price: 59.99 },
  { id: "medium", label: "Medium", dimensions: "12\" x 16\"", price: 79.99 },
  { id: "large", label: "Large", dimensions: "18\" x 24\"", price: 109.99 },
  { id: "xl", label: "Extra Large", dimensions: "24\" x 36\"", price: 149.99 },
];

// Sample frame options
const sampleFrames: FrameOption[] = [
  { id: "black", label: "Classic Black", price: 24.99, color: "#1a1a1a" },
  { id: "gold", label: "Gold Ornate", price: 39.99, color: "#c9a227" },
  { id: "white", label: "Modern White", price: 24.99, color: "#f5f5f5" },
  { id: "walnut", label: "Walnut Wood", price: 34.99, color: "#5d4037" },
];

/**
 * Product page
 *
 * Shows the 4-step wizard for product customization.
 */
export default function ProductPage({ locale, handle }: ProductPageProps) {
  const router = useRouter();
  const { reset } = useWizard();

  // Reset wizard when navigating to a new product
  useEffect(() => {
    reset();
  }, [handle, reset]);

  // Fetch product data
  const productQuery = api.storefront.getProduct.useQuery({ handle });

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading product...</div>
      </div>
    );
  }

  if (productQuery.error || !productQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const product = productQuery.data;
  const basePrice = parseFloat(product.variants.edges[0]?.node.price.amount ?? "59.99");

  return (
    <>
      <Head>
        <title>{product.title} - La Vistique</title>
        <meta name="description" content={product.description?.substring(0, 160)} />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Product header */}
        <div className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-gray-500 mb-4">
              <a href={`/${locale}`} className="hover:text-gray-900">Home</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{product.title}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          </div>
        </div>

        {/* Wizard */}
        <WizardContainer
          productId={product.id}
          productHandle={product.handle}
          productTitle={product.title}
          basePrice={basePrice}
          costumes={sampleCostumes}
          sizes={sampleSizes}
          frames={sampleFrames}
        />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async (context) => {
  const locale = context.params?.locale as string;
  const handle = context.params?.handle as string;

  return {
    props: {
      locale,
      handle,
    },
  };
};
