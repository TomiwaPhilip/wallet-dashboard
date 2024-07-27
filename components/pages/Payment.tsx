"use client";

import { useEffect, useState } from "react";
import { NoOutlineButtonIcon } from "../shared/buttons";
import { FullModal } from "../shared/Modal";
import { Card2, InvoiceBarProps, InvoicesAndPaymentBar } from "../shared/shared";
import PaymentLink from "../forms/payments/PaymentLink";
import InvoicePayment from "../forms/payments/InvoicePayment";
import { fetchPaymentLinkAndInvoice } from "@/server/actions/payments/invoice.action";

export default function Payment() {
  const [isModalOpen, setIsModalOpen] = useState<boolean | null>(false);
  const [isModalOpen2, setIsModalOpen2] = useState<boolean | null>(false);
  const [invoiceBarData, setInvoiceBarData] = useState<InvoiceBarProps[] | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsModalOpen2(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(null);
    setIsModalOpen2(null);
  };

  const handleOpenModal2 = () => {
    setIsModalOpen2(true);
    setIsModalOpen(null);
  };

  const handleCloseModal2 = () => {
    setIsModalOpen(null);
    setIsModalOpen2(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPaymentLinkAndInvoice();
      setInvoiceBarData(data);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="grid grid-cols-[40%_60%] gap-7">
        <div className="">
          <Card2>
            <div className="flex-col items-center justify-center gap-10">
              <h3 className="font-medium text-[20px] mb-[2rem]">
                Receive Payments
              </h3>
              <div className="my-[19vh]">
                <NoOutlineButtonIcon
                  name="Create a Payment Link"
                  type="button"
                  iconSrc="/assets/icons/add_diamond.svg"
                  buttonClassName="w-full my-3"
                  onClick={handleOpenModal}
                />
                <NoOutlineButtonIcon
                  name="Create an Invoice"
                  type="button"
                  iconSrc="/assets/icons/add_diamond.svg"
                  buttonClassName="w-full my-3"
                  onClick={handleOpenModal2}
                />
              </div>
            </div>
          </Card2>
        </div>
        <div className="">
          <Card2>
            <h3 className="font-medium text-[20px] mb-5">
              Recent Invoices & Payments
            </h3>
            {invoiceBarData ? (
              invoiceBarData.map((data, index) => (
                <InvoicesAndPaymentBar
                  key={index}
                  type={data.type}
                  text={data.text}
                  url={data.url}
                  invoiceId={data.invoiceId}
                />
              ))
            ) : (
              <p>No recent invoices or payment links found.</p>
            )}
          </Card2>
        </div>
      </div>
      <FullModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <PaymentLink />
      </FullModal>
      <FullModal isOpen={isModalOpen2} onClose={handleCloseModal2}>
        <InvoicePayment />
      </FullModal>
    </>
  );
}
