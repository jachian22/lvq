import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

/**
 * Root index page
 *
 * Redirects to the default locale (NL for Netherlands).
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get browser language preference
    const browserLang = navigator.language.split("-")[0]?.toUpperCase();
    const supportedLangs = ["NL", "EN", "DE", "FR"];
    const locale = supportedLangs.includes(browserLang ?? "") ? browserLang : "NL";

    router.replace(`/${locale?.toLowerCase()}`);
  }, [router]);

  return (
    <>
      <Head>
        <title>La Vistique - Custom Pet Portraits</title>
        <meta name="description" content="Transform your pet into royalty with custom hand-painted portraits" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="animate-pulse text-stone-500 font-display">Loading...</div>
      </main>
    </>
  );
}
