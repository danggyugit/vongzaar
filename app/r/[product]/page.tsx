import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer, Header, ProductGrid } from "@/components/Chrome";
import { HeroIcon } from "@/components/HeroIcon";
import { PremiumGate } from "@/components/PremiumGate";
import { Sections } from "@/components/Sections";
import { ShareButtons } from "@/components/ShareButtons";
import { freeResult, parseInput } from "@/lib/engines";
import { isProductId, PRODUCTS } from "@/lib/products";

type Props = { params: Promise<{ product: string }>; searchParams: Promise<{ d?: string | string[] }> };

async function load({ params, searchParams }: Props) {
  const { product } = await params;
  const { d } = await searchParams;
  if (!isProductId(product)) return null;
  const data = typeof d === "string" ? d : undefined;
  const input = parseInput(product, data);
  return { product, d: data, input };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const ctx = await load(props);
  if (!ctx?.input || !ctx.d) return {};
  const r = freeResult(ctx.product, ctx.input);
  const title = `${r.kicker} — ${r.title}`;
  const image = `/api/og?product=${ctx.product}&d=${ctx.d}`;
  return {
    title,
    description: r.share,
    robots: { index: false },
    openGraph: { title, description: r.share, images: [{ url: image, width: 800, height: 400 }] },
    twitter: { card: "summary_large_image", title, description: r.share, images: [image] },
  };
}

export default async function Page(props: Props) {
  const ctx = await load(props);
  if (!ctx) notFound();
  const meta = PRODUCTS[ctx.product];
  if (!ctx.input || !ctx.d) redirect(meta.start);

  const r = freeResult(ctx.product, ctx.input);
  const path = `/r/${ctx.product}?d=${ctx.d}`;

  return (
    <>
      <Header />
      <main className="main" style={{ ["--c" as string]: meta.color }}>
        <section className="result-hero">
          <HeroIcon d={ctx.d} emoji={r.emoji} />
          <p className="result-kicker">{r.kicker}</p>
          <h1>{r.title}</h1>
          <p className="result-sub">{r.subtitle}</p>
          <div className="tags">
            {r.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </section>

        <Sections sections={r.sections} color={meta.color} />

        <ShareButtons path={path} text={r.share} title={`${r.kicker} — ${r.title}`} image={`/api/og?product=${ctx.product}&d=${ctx.d}`} />

        {meta.premium && <PremiumGate product={ctx.product} d={ctx.d} name={ctx.input.n} />}

        {ctx.product === "age" && (
          <Link href="/s/health" className="cross" style={{ ["--c" as string]: PRODUCTS.health.color }}>
            <span aria-hidden>🩺</span>
            <div>
              <strong>이 나이에 꼭 챙겨야 할 건강 관리는?</strong>
              <span>체중만 더 입력하면 건강 리포트를 무료로 볼 수 있어요</span>
            </div>
            <i aria-hidden>→</i>
          </Link>
        )}

        <Link href={meta.start} className="btn outline big">
          우리 아이로 {meta.title} 해보기
        </Link>

        <ProductGrid exclude={ctx.product} heading="다른 것도 궁금하다면" />
      </main>
      <Footer />
    </>
  );
}
