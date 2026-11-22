import { NextResponse } from "next/server";
import { parseInput } from "@/lib/engines";
import { premiumResult } from "@/lib/premium";
import { isProductId } from "@/lib/products";
import { verifyToken } from "@/lib/token";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const product = body?.product;
  const d = body?.d;
  if (!isProductId(product) || typeof d !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  const input = parseInput(product, d);
  if (!input) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    if (!verifyToken(body?.token, product, d)) return NextResponse.json({ ok: false }, { status: 403 });
    const result = premiumResult(product, input);
    if (!result) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[premium]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
