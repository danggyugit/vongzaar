import type { Metadata } from "next";
import { Footer, Header } from "@/components/Chrome";
import { Quiz } from "@/components/Quiz";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "멍BTI · 냥BTI 성격유형 테스트",
  description: PRODUCTS.mbti.tagline,
  openGraph: { title: "멍BTI · 냥BTI 성격유형 테스트", description: PRODUCTS.mbti.tagline, images: [{ url: "/api/og?product=mbti", width: 800, height: 400 }] },
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="main">
        <Quiz />
      </main>
      <Footer />
    </>
  );
}
