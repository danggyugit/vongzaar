import { Footer, Header, ProductGrid } from "@/components/Chrome";
import { ProfileCard } from "@/components/ProfileCard";
import { PRICE } from "@/lib/products";

export default function Home() {
  return (
    <>
      <Header />
      <main className="main">
        <section className="hero">
          <p className="hero-kicker">강아지 · 고양이 보호자를 위한</p>
          <h1>
            우리 아이,
            <br />
            얼마나 알고 있나요?
          </h1>
          <p className="hero-sub">성격부터 운세, 건강까지. 가입 없이 무료로 바로 확인해 보세요.</p>
        </section>

        <ProfileCard />
        <ProductGrid />

        <section className="how">
          <h2 className="section-title">이렇게 이용해요</h2>
          <ol>
            <li>
              <b>1</b>
              <div>
                <strong>무료로 결과 확인</strong>
                <span>여섯 가지 모두 기본 결과는 무료예요.</span>
              </div>
            </li>
            <li>
              <b>2</b>
              <div>
                <strong>더 궁금하면 {PRICE.toLocaleString("ko-KR")}원</strong>
                <span>간식 하나 값으로 심층 리포트를 열어보세요.</span>
              </div>
            </li>
            <li>
              <b>3</b>
              <div>
                <strong>카톡으로 공유</strong>
                <span>친구네 아이와 결과를 비교해 보세요.</span>
              </div>
            </li>
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
