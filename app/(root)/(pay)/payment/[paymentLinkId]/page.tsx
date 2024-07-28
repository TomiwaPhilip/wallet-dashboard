import PaymentLink from "@/components/pages/PaymentLink";

interface PaymentPageProps {
  params: {
    paymentLinkId: string;
  };
}

export default function Page({ params }: PaymentPageProps) {
  return (
    <div>
      <PaymentLink />
    </div>
  );
}
