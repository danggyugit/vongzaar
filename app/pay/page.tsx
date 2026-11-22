import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer, Header } from "@/components/Chrome";
import { Checkout } from "@/components/Checkout";

export const metadata: Metadata = { title: "결제", robots: { index: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main className="main">
        <Suspense>
          <Checkout />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
