import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { freeResult, parseInput } from "@/lib/engines";
import { isProductId, PRODUCTS, SITE_NAME, SITE_TAGLINE } from "@/lib/products";

export const runtime = "nodejs";

let font: Promise<Buffer> | null = null;
const loadFont = () => (font ??= readFile(path.join(process.cwd(), "assets", "Pretendard-Bold.otf")));

// 이모지는 글꼴에 없어 깨지므로 미리보기 이미지에서는 뺀다
const plain = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "").trim();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const product = url.searchParams.get("product");
  let kicker = SITE_NAME;
  let title = "우리 아이, 얼마나 알고 있나요?";
  let sub = "성격유형 · 운세 · 사주 · 관상 · 나이 · 건강";
  let color = "#ff8a5c";

  if (isProductId(product)) {
    color = PRODUCTS[product].color;
    const input = parseInput(product, url.searchParams.get("d"));
    if (input) {
      const r = freeResult(product, input);
      kicker = plain(r.kicker);
      title = plain(r.title);
      sub = r.tags.map(plain).slice(0, 3).join("  ·  ");
    } else {
      kicker = PRODUCTS[product].title;
      title = PRODUCTS[product].tagline;
      sub = SITE_TAGLINE;
    }
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: color, padding: 36, fontFamily: "Pretendard" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fffaf3", borderRadius: 40, padding: "36px 48px" }}>
          <div style={{ display: "flex", fontSize: 30, color }}>{kicker}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: title.length <= 8 ? 72 : title.length <= 14 ? 52 : 42, color: "#2b2118", lineHeight: 1.2 }}>{title}</div>
            <div style={{ display: "flex", fontSize: 26, color: "#8a7a6b", marginTop: 14 }}>{sub}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 26, color: "#2b2118" }}>{SITE_NAME}</div>
            <div style={{ display: "flex", fontSize: 24, color: "#fff", background: color, borderRadius: 999, padding: "10px 24px" }}>우리 아이도 해보기</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
      fonts: [{ name: "Pretendard", data: await loadFont(), weight: 700, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
