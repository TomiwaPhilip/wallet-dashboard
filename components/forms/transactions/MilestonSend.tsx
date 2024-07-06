import React, { useState } from "react";

import { NoOutlineButtonIcon } from "@/components/shared/buttons";
import { useSession } from "@/components/shared/session";
import { sendFundsToMilestonUser, sendFundsToWallet } from "@/server/actions/transactions/send.action";
import { TransactionMessage } from "@/components/shared/shared";

interface FormData {
  identifier: string;
  amount: string;
  secretPhrase: string;
}

const MilestonSend: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    identifier: "",
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
  
    // Validate email, phone number, or wallet address
    if (!data.identifier.trim()) {
      newErrors.identifier = "Email, phone number, or wallet address is required";
    } else if (
      !/\S+@\S+\.\S+/.test(data.identifier) && // Check for email format
      !/^\+\d{1,3}\d{10}$/.test(data.identifier) && // Check for phone number format (10 digits)
      !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(data.identifier) // Check for wallet address format (Ethereum-like)
    ) {
      newErrors.identifier = "Invalid email, phone number, or wallet address";
    }
  
    // Validate amount
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
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        console.log(formData);
        // Call your submit function here
        const response = await sendFundsToWallet({
          identifier: formData.identifier,
          amount: formData.amount,
          secretPhrase: formData.secretPhrase,
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
              <label className="block text-sm font-medium">Mileston Wallet/Email Address or Phone Number</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="example@mail.com"
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.identifier ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
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
              Available Balance: ${session?.walletBalance} USDT
            </p>

            <div className="flex items-center justify-center">
              <NoOutlineButtonIcon
                name="Send to User"
                type="submit"
                disabled={disable}
                loading={disable}
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

export default MilestonSend;
