import { NoOutlineButtonIcon } from "@/components/shared/buttons";
import React, { useState } from "react";

interface FormData {
  usdtNetwork: string;
  walletAddress: string;
  amount: string;
}

const ExternalSend: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    usdtNetwork: "",
    walletAddress: "",
    amount: "0",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [disable, setDisable] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validate = (data: FormData) => {
    const newErrors: Partial<FormData> = {};

    if (!data.usdtNetwork) {
      newErrors.usdtNetwork = "USDT Network is required";
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
        // await sendEmail(formData.email);
        setIsSubmitted(true);
        setDisable(false);
      } catch (error) {
        console.error("Error sending email:", error);
        setDisable(false);
      }
    }
  };

  return (
    <>
      {isSubmitted ? (
        <div className="text-center">
          <p className="font-bold text-[24px] p-5">
            You have successfully joined the waitlist for early access. Now,
            join our discord server to continue to discover more.
          </p>
        </div>
      ) : (
        <>
          <p className="text-center font-bold text-[24px] mb-8">
            Enter Transaction Details
          </p>
          <form onSubmit={handleSubmit} className="w-full mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium">USDT Network</label>
              <select
                name="usdtNetwork"
                value={formData.usdtNetwork}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.usdtNetwork ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8]`}
              >
                <option value="">Select USDT Network</option>
                <option value="Ethereum">Ethereum</option>
                <option value="Binance Smart Chain">Binance Smart Chain</option>
                <option value="TRON">TRON</option>
                <option value="TON">TON</option>
                <option value="Avaxc">Avax Chain</option>
              </select>
              {errors.usdtNetwork && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.usdtNetwork}
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
              Available Balance: 450,000 USDT
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
