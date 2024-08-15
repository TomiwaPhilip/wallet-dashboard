import React, { useState } from "react";

import { NoOutlineButtonIcon } from "@/components/shared/buttons";
import { useSession } from "@/components/shared/session";
import { TransactionMessage } from "@/components/shared/shared";
import { sendFundsToExternalWallet, sendFundsToWallet } from "@/server/actions/transactions/send.action";

interface FormData {
  usdcNetwork: string;
  walletAddress: string;
  amount: string;
  secretPhrase: string;
}

const ExternalSend: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    usdcNetwork: "",
    walletAddress: "",
    amount: "0",
    secretPhrase: "",
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

    // Validate secretPhrase with 6 words
    if (!data.secretPhrase.trim()) {
      newErrors.secretPhrase = "Secret phrase is required";
    } else {
      const words = data.secretPhrase.trim().split(/\s+/);
      if (words.length !== 6) {
        newErrors.secretPhrase = "Secret phrase must contain exactly 6 words";
      }
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
        console.log("Forms:")
        console.log(formData)
        const response = await sendFundsToWallet({
          identifier: formData.walletAddress,
          amount: formData.amount,
          secretPhrase: formData.secretPhrase,
        });
        if (response.error) {
          setMessage(response.error);
          setMessageType(false);
        } else if (response.message) {
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
                <option value="" disabled>Select USDC Network</option>
                <option value="Solana">Solana</option>
                {/* <option value="Ethereum">Ethereum</option>
                <option value="Binance Smart Chain">Binance Smart Chain</option>
                <option value="TRON">TRON</option>
                <option value="Avaxc">Avax Chain</option> */}
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

            <div className="mb-4">
              <label className="block text-sm font-medium">Secret Phrase</label>
              <input
                type="password"
                name="secretPhrase"
                value={formData.secretPhrase}
                placeholder="*****"
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.secretPhrase ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
              />
              {errors.secretPhrase && (
                <p className="text-red-500 text-sm mt-1">{errors.secretPhrase}</p>
              )}
            </div>

            <p className="text-[#979EB8] text-[16px] mb-10">
              Available Balance: ${session?.walletBalance} USDC
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
