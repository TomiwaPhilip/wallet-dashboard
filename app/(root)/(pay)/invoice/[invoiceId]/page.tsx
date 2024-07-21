interface InvoicePageProps {
    params: {
      invoiceId: string;
    };
  }
  
  export default function Page({ params }: InvoicePageProps) {
    return (
        <div>
            <h1> This is the invoice page {params.invoiceId} </h1>
        </div>
    );
  }
  