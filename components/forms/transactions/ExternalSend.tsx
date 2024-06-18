import React, { useState } from "react";

import { NoOutlineButtonIcon } from "@/components/shared/buttons";
import { useSession } from "@/components/shared/session";
import { TransactionMessage } from "@/components/shared/shared";
import { sendFundsToExternalWallet } from "@/lib/actions/transactions/send.action";

interface FormData {
  usdcNetwork: string;
  walletAddress: string;
  amount: string;
}

const ExternalSend: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    usdcNetwork: "",
    walletAddress: "",
    amount: "0",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(false);
  const [disable, setDisable] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const session = useSession();

  const validate = (data: FormData) => {
    const newErrors: Partial<FormData> = {};

    if (!data.usdcNetwork) {
      newErrors.usdcNetwork = "usdc Network is required";
    }

    if (!data.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    }

    if (!data.amount) {
      newErrors.amount = "Amount must be greater than 0";
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
    setIsValid(Object.keys(validate(formData)).length === 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisable(true);
    setIsSubmitted(false);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setDisable(false);
    } else {
      console.log("Form Data Submitted:", formData);

      try {
        // Call your submit function here
        const response = await sendFundsToExternalWallet({
          walletAddress: formData.walletAddress,
          usdcNetwork: formData.usdcNetwork,
          amount: formData.amount,
        });
        if (response.error) {
          setMessage(response.error);
          setMessageType(false);
        } else if(response.message) {
          setMessage(response.message);
          setMessageType(true);
        }
        setIsSubmitted(true);
        setDisable(false);
      } catch (error) {
        console.error("Error sending email:", error);
        setDisable(false);
        setMessage("Unable to complete transaction. Please try again!")
      }
    }
  };

  return (
    <>
      {isSubmitted ? (
        <div className="text-center flex items-center justify-center">
          <TransactionMessage 
            message={message} 
            type={messageType} 
          />
        </div>
      ) : (
        <>
          <p className="text-center font-bold text-[24px] mb-8">
            Enter Transaction Details
          </p>
          <form onSubmit={handleSubmit} className="w-full mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium">USDC Network</label>
              <select
                name="usdcNetwork"
                value={formData.usdcNetwork}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.usdcNetwork ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8]`}
              >
                <option value="">Select USDC Network</option>
                <option value="Ethereum">Solana</option>
                <option value="Ethereum">Ethereum</option>
                <option value="Binance Smart Chain">Binance Smart Chain</option>
                <option value="TRON">TRON</option>
                <option value="TON">TON</option>
                <option value="Avaxc">Avax Chain</option>
              </select>
              {errors.usdcNetwork && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.usdcNetwork}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                Wallet Address
              </label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                placeholder="Wallet address"
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.walletAddress ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
              />
              {errors.walletAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.walletAddress}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                placeholder="12,000.00"
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.amount ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <p className="text-[#979EB8] text-[16px] mb-10">
              Available Balance: ${session?.walletBalance?.toFixed(2)} USDC
            </p>

            <div className="flex items-center justify-center">
              <NoOutlineButtonIcon
                name="Send to User"
                type="submit"
                disabled={disable}
                iconSrc="/assets/icons/arrow_circle_left.svg"
                buttonClassName="w-full"
              />
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default ExternalSend;
