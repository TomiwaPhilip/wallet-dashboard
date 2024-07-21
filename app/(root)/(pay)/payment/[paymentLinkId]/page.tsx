interface PaymentPageProps {
    params: {
      paymentLinkId: string;
    };
  }
  
  export default function Page({ params }: PaymentPageProps) {
    return (
        <div>
          <h1> This is the payment page {params.paymentLinkId} </h1>
      </div>
    );
  }
  