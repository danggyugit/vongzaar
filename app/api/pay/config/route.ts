import { NextResponse } from "next/server";
import { payMode } from "@/lib/toss";

export const dynamic = "force-dynamic";

export function GET() {
  const mode = payMode();
  return NextResponse.json({ mode, clientKey: mode === "toss" ? (process.env.TOSS_CLIENT_KEY ?? null) : null });
}
