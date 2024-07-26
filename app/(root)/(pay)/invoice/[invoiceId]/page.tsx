import InvoicePage from "@/components/pages/Invoice";

interface InvoicePageProps {
  params: {
    invoiceId: string;
  };
}

export default function Page({ params }: InvoicePageProps) {
  return (
    <InvoicePage invoiceId={params.invoiceId} customerEmail="example@shit.com" amountDue="10" status="Due" />
  );
}
