"use client";

import { useState } from "react";
import useSWR from 'swr';

import {
  NoOutlineButtonBig,
  NoOutlineButtonIcon,
} from "@/components/shared/buttons";
import { Card2, Tabs } from "../shared/shared";
import Modal from "../shared/Modal";
import MilestonSend from "../forms/transactions/MilestonSend";
import ExternalSend from "../forms/transactions/ExternalSend";
import { RiLoader4Line } from "react-icons/ri";
import TransactionHistory from "../shared/TransactionHistory";
import Receive from "../forms/transactions/Receive";

export default function HomePage() {

  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data, error, isLoading } = useSWR('/api/transactions/balance', fetcher, {refreshInterval: 1000});

  console.log(isLoading);
  if (!isLoading) {
    console.log(data);
  }

  const [activeTab, setActiveTab] = useState<"account" | "payment">("account");

  const handleTabChange = (tab: "account" | "payment") => {
    setActiveTab(tab);
    // handle other state changes here
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean | null>(false);
  const [isModalOpen2, setIsModalOpen2] = useState<boolean | null>(false);
  const [isModalOpen3, setIsModalOpen3] = useState<boolean | null>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsModalOpen2(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(null);
    setIsModalOpen2(null);
    setIsModalOpen3(null);
  };

  const handleOpenModal2 = () => {
    setIsModalOpen2(true);
    setIsModalOpen(null);
    setIsModalOpen3(null);
  };

  const handleCloseModal2 = () => {
    setIsModalOpen(null);
    setIsModalOpen2(null);
    setIsModalOpen3(null);
  };

  const handleOpenModal3 = () => {
    setIsModalOpen3(true);
    setIsModalOpen(null);
    setIsModalOpen2(null);
  };

  const handleCloseModal3 = () => {
    setIsModalOpen(null);
    setIsModalOpen3(null);
    setIsModalOpen2(null);
  };

  return (
    <>
      <div className="grid grid-cols-[40%_60%] gap-7">
        <div className="">
          <div className="w-full block mb-7">
            <Tabs
              isAccountActive={activeTab === "account"}
              isPaymentActive={activeTab === "payment"}
              onTabChange={handleTabChange}
            />
          </div>
          <div className="">
            <Card2>
              {activeTab === "account" ? (
                <>
                  <h3 className="font-medium text-[20px]">Account Balance</h3>
                  {isLoading ? (
                    <RiLoader4Line className="animate-spin text-2xl mb-10" />
                  ) : (
                    <p className="mt-[4rem] font-bold text-[40px] mb-10">
                      ${data.balance.toFixed(2)} {/* Render balance when data is available */}
                    </p>
                  )}
                  {!isLoading && (
                    <TransactionHistory renderAll={false} specificIndex={0} />
                  )}
                </>
              ) : (
                <div className="flex-col items-center justify-center gap-10">
                  <h3 className="font-medium text-[20px] mb-[2rem]">
                    Transaction Method
                  </h3>
                  <NoOutlineButtonIcon
                    name="Receive to Mileston Wallet"
                    type="button"
                    iconSrc="/assets/icons/arrow_circle_right.svg"
                    buttonClassName="w-full my-3"
                    onClick={handleOpenModal3}
                  />
                  <NoOutlineButtonIcon
                    name="Send to Mileston User"
                    type="button"
                    iconSrc="/assets/icons/arrow_circle_left.svg"
                    buttonClassName="w-full my-3"
                    onClick={handleOpenModal}
                  />
                  <NoOutlineButtonIcon
                    name="Send to External Wallet"
                    type="button"
                    iconSrc="/assets/icons/arrow_circle_left.svg"
                    buttonClassName="w-full my-3"
                    onClick={handleOpenModal2}
                  />
                </div>
              )}
            </Card2>
          </div>
        </div>
        <div className="">
          <Card2>
            <h3 className="font-medium text-[20px] mb-5">
              Transaction History
            </h3>
            <TransactionHistory />
          </Card2>
        </div>
      </div>
      <Modal isOpen={isModalOpen3} onClose={handleCloseModal}>
        <Receive />
      </Modal>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <MilestonSend />
      </Modal>
      <Modal isOpen={isModalOpen2} onClose={handleCloseModal2}>
        <ExternalSend />
      </Modal>
    </>
  );
}
