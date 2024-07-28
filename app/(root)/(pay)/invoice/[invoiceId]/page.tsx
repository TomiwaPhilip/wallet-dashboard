import InvoicePage from "@/components/pages/Invoice";

interface InvoicePageProps {
  params: {
    invoiceId: string;
  };
}

export default function Page({ params }: InvoicePageProps) {
  return <InvoicePage invoiceId={params.invoiceId} />;
}
