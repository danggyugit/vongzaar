import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/Chrome";
import { ServiceForm } from "@/components/ServiceForm";
import { isProductId, PRODUCTS } from "@/lib/products";

type Props = { params: Promise<{ product: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await params;
  if (!isProductId(product)) return {};
  const p = PRODUCTS[product];
  return { title: p.title, description: p.tagline, openGraph: { title: p.title, description: p.tagline, images: [{ url: `/api/og?product=${product}`, width: 800, height: 400 }] } };
}

export default async function Page({ params }: Props) {
  const { product } = await params;
  if (!isProductId(product) || product === "mbti") notFound();
  return (
    <>
      <Header />
      <main className="main">
        <ServiceForm product={product} />
      </main>
      <Footer />
    </>
  );
}
