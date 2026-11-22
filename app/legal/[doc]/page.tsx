import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/Chrome";
import { PRICE, SITE_NAME } from "@/lib/products";

const price = `${PRICE.toLocaleString("ko-KR")}원`;

const DOCS: Record<string, { title: string; blocks: [string, string][] }> = {
  terms: {
    title: "이용약관",
    blocks: [
      ["서비스 내용", `${SITE_NAME}은(는) 반려동물 보호자를 위한 성격유형 테스트, 운세, 사주, 관상, 나이 계산, 건강 리포트 콘텐츠를 제공합니다. 기본 결과는 무료이며, 심층 리포트는 건당 ${price}에 제공됩니다.`],
      ["콘텐츠의 성격", "운세·사주·관상·성격유형 콘텐츠는 재미를 위한 것으로 과학적 근거를 보장하지 않습니다. 건강 리포트는 일반적인 사양 관리 기준에 따른 참고 정보이며 수의사의 진단·처방을 대신하지 않습니다."],
      ["유료 콘텐츠 이용", "유료 리포트는 결제한 기기의 브라우저에 열람 정보가 저장되는 방식으로 제공됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서 접속하면 다시 열람하지 못할 수 있습니다. '이달의 운세 리포트'는 결제한 달의 말일까지 이용할 수 있습니다."],
      ["책임의 한계", "이용자가 입력한 정보의 정확성에 따라 결과가 달라질 수 있으며, 콘텐츠를 근거로 한 판단의 책임은 이용자에게 있습니다."],
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    blocks: [
      ["수집하는 정보", "회원가입이 없으며, 이름·연락처 등 이용자를 식별하는 개인정보를 수집하지 않습니다. 반려동물의 이름·생일·체중 등 입력값은 결과 링크(URL)에 담겨 결과를 만드는 데만 사용되고 서버에 저장되지 않습니다."],
      ["기기에 저장되는 정보", "편의를 위해 반려동물 프로필(이름, 생일, 사진)과 결제한 리포트의 열람 정보가 이용자 기기의 브라우저 저장소에 보관됩니다. 사진은 서버로 전송되지 않습니다."],
      ["결제 정보", "결제는 토스페이먼츠를 통해 처리되며, 카드번호 등 결제수단 정보는 당사가 보관하지 않습니다. 결제 확인을 위해 주문번호와 결제 금액이 결제대행사와 주고받아집니다."],
      ["공유 링크", "결과 링크에는 입력한 반려동물 정보가 포함되어 있어, 링크를 받은 사람은 같은 결과 화면을 볼 수 있습니다."],
    ],
  },
  refund: {
    title: "환불정책",
    blocks: [
      ["디지털 콘텐츠의 청약철회", "유료 리포트는 결제 즉시 열람되는 디지털 콘텐츠로, 전자상거래법에 따라 열람이 시작된 이후에는 단순 변심에 의한 청약철회가 제한될 수 있습니다."],
      ["환불이 가능한 경우", "결제가 되었으나 리포트가 열리지 않은 경우, 중복 결제된 경우, 서비스 오류로 정상적인 이용이 불가능했던 경우에는 전액 환불해 드립니다."],
      ["환불 방법", "아래 문의처로 결제 일시와 결제 수단을 알려주시면 확인 후 영업일 기준 3일 이내에 결제 취소로 처리합니다."],
      ["문의처", "이메일: (운영자 이메일을 입력해 주세요)"],
    ],
  },
};

type Props = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await params;
  return DOCS[doc] ? { title: DOCS[doc].title } : {};
}

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export default async function Page({ params }: Props) {
  const { doc } = await params;
  const data = DOCS[doc];
  if (!data) notFound();
  return (
    <>
      <Header />
      <main className="main legal">
        <h1>{data.title}</h1>
        {data.blocks.map(([h, body]) => (
          <section key={h}>
            <h2>{h}</h2>
            <p>{body}</p>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
