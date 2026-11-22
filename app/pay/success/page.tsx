import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Chrome";
import { PaySuccess } from "@/components/PayResult";

export const metadata: Metadata = { title: "결제 확인", robots: { index: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main className="main">
        <Suspense>
          <PaySuccess />
        </Suspense>
      </main>
    </>
  );
}
