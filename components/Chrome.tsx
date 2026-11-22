import Link from "next/link";
import { PRODUCT_LIST, SITE_NAME } from "@/lib/products";
import type { ProductId } from "@/lib/types";

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo">
        <span aria-hidden>🐾</span> {SITE_NAME}
      </Link>
    </header>
  );
}

export function ProductGrid({ exclude, heading }: { exclude?: ProductId; heading?: string }) {
  return (
    <div>
      {heading && <h2 className="section-title">{heading}</h2>}
      <div className="grid">
        {PRODUCT_LIST.filter((p) => p.id !== exclude).map((p) => (
          <Link href={p.start} className="tile" key={p.id} style={{ ["--c" as string]: p.color }}>
            <span className="tile-emoji" aria-hidden>
              {p.emoji}
            </span>
            <strong>{p.title}</strong>
            <span className="tile-tag">{p.tagline}</span>
            <span className="tile-meta">무료 · {p.minutes}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <nav>
        <Link href="/legal/terms">이용약관</Link>
        <Link href="/legal/privacy">개인정보처리방침</Link>
        <Link href="/legal/refund">환불정책</Link>
      </nav>
      <p>
        상호 · 대표자 · 사업자등록번호 · 통신판매업 신고번호 · 주소 · 연락처
        <br />
        (실결제 오픈 전 사업자 정보를 입력해 주세요)
      </p>
      <p>운세·사주·관상·성격유형은 재미를 위한 콘텐츠이며, 건강 리포트는 수의사의 진단을 대신하지 않습니다.</p>
    </footer>
  );
}
