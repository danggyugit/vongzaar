import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Chrome";
import { PayFail } from "@/components/PayResult";

export const metadata: Metadata = { title: "결제 실패", robots: { index: false } };

export default function Page() {
  return (
    <>
      <Header />
      <main className="main">
        <Suspense>
          <PayFail />
        </Suspense>
      </main>
    </>
  );
}
