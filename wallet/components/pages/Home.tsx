"use client";

import { useState } from "react";

import {
  NoOutlineButtonBig,
  NoOutlineButtonIcon,
} from "@/components/shared/buttons";
import { signOut } from "@/lib/actions/auth/login.action";
import { Card2, Tabs, TransactionBar } from "../shared/shared";
import Modal from "../shared/Modal";
import MilestonSend from "../forms/transactions/MilestonSend";
import ExternalSend from "../forms/transactions/ExternalSend";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"account" | "payment">("account");

  const handleTabChange = (tab: "account" | "payment") => {
    setActiveTab(tab);
    // handle other state changes here
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean | null>(false);
  const [isModalOpen2, setIsModalOpen2] = useState<boolean | null>(false);

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

  // const handleSignOut = async () => {
  //   await signOut();
  // };
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
                  <p className="mt-[4rem] font-bold text-[40px] mb-10">
                    $450,987.65
                  </p>
                  <TransactionBar
                    type="received"
                    text="Last Received Payment: $12,000..."
                  />
                </>
              ) : (
                <div className="flex-col items-center justify-center gap-10">
                  <h3 className="font-medium text-[20px] mb-[4rem]">
                    Transaction Method
                  </h3>
                  <NoOutlineButtonIcon
                    name="Send to Mileston User"
                    type="button"
                    iconSrc="/assets/icons/arrow_circle_right.svg"
                    buttonClassName="w-full my-10"
                    onClick={handleOpenModal}
                  />
                  <NoOutlineButtonIcon
                    name="Send to External Wallet"
                    type="button"
                    iconSrc="/assets/icons/arrow_circle_left.svg"
                    buttonClassName="w-full my-10"
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
            <TransactionBar
              type="received"
              text="Received $12,000.50 from Jones Durover at 12:40PM"
            />
            <TransactionBar
              type="sent"
              text="Sent $120,000.50 to Felnsusis Guirome at 05:40AM"
            />
            <TransactionBar
              type="received"
              text="Received $30,895.50 from Patrick Frendy Zone at 12-06-2024"
            />
            <TransactionBar
              type="sent"
              text="Sent $2,000.50 to John Doe Tee at 11-06-2024"
            />
            <TransactionBar
              type="sent"
              text="Sent $12,000.50 to Jones Durover at 11-06-2024"
            />
          </Card2>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <MilestonSend />
      </Modal>
      <Modal isOpen={isModalOpen2} onClose={handleCloseModal2}>
        <ExternalSend />
      </Modal>
    </>
  );
}
