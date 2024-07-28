import Image from "next/image";
import { NoOutlineButtonBig } from "../shared/buttons";
import { Card2 } from "../shared/shared";
import { useEffect, useState } from "react";
import { useSession } from "../shared/session";
import Modal from "../shared/Modal";
import {
  PaymentDetails,
  PaymentLinkFormDetails,
  getPaymentDetailsById,
  payUser,
} from "@/server/actions/payments/paymentlink.action";

interface FormData {
  secretPhrase: string;
  customerInfo?: string;
}

interface Props {
  paymentLinkId: string;
}

interface ErrorResponse {
  error: string;
}

type ResponseData = PaymentLinkFormDetails | PaymentDetails | ErrorResponse;

function isPaymentDetails(data: ResponseData): data is PaymentDetails {
  return (
    (data as PaymentDetails).amount !== undefined &&
    (data as PaymentDetails).receiverUserEmail !== undefined
  );
}

// Type guard to check if the response is an error
function isErrorResponse(response: any): response is ErrorResponse {
  return response && typeof response.error === "string";
}

export default function PaymentLink({ paymentLinkId }: Props) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    secretPhrase: "",
    customerInfo: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean | null>(false);
  const [isValid, setIsValid] = useState(false);
  const [disable, setDisable] = useState(false);
  const [response, setResponse] = useState(false);
  const session = useSession();

  // Function to handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(null);
  };

  const validate = (data: FormData) => {
    const newErrors: Partial<FormData> = {};

    // Validate secretPhrase with 6 words
    if (!data.secretPhrase.trim()) {
      newErrors.secretPhrase = "Secret phrase is required";
    } else {
      const words = data.secretPhrase.trim().split(/\s+/);
      if (words.length !== 6) {
        newErrors.secretPhrase = "Secret phrase must contain exactly 6 words";
      }
    }

    // Validate customerInfo
    if (!data.customerInfo) {
      newErrors.customerInfo = "Customer info is required!";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsValid(Object.keys(validate(formData)).length === 0);
  };

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const data = await getPaymentDetailsById(paymentLinkId);

        if (isErrorResponse(data)) {
          setError(true);
          setMessage(data.error);
        } else if (isPaymentDetails(data)) {
          setPaymentDetails(data);
          if (session?.email === paymentDetails?.receiverUserEmail) {
            setDisable(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch payment details:", error);
        setError(true);
        setMessage("Failed to fetch payment details.");
      }
    };

    if (paymentLinkId) {
      fetchPaymentData();
    }
  }, [paymentLinkId]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleCloseModal();
    setError(false);
    setMessage("");
    setResponse(false);

    console.log("I was clicked!");
    setLoading(true);
    setDisable(true);
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
    } else {
      setLoading(true);
      setDisable(true);
      console.log("Form Data Submitted:", formData);

      try {
        console.log(formData);
        const response = await payUser({
          identifier: paymentDetails?.identifier as string,
          secretPhrase: formData.secretPhrase,
          amount: paymentDetails?.amount as string,
          paymentLinkId: paymentLinkId,
        });

        if (response != undefined && response.message != undefined) {
          setLoading(false);
          setDisable(false);
          setResponse(true);
          setMessage(response.message);
        } else if (response != undefined && response.error != undefined) {
          setLoading(false);
          setDisable(false);
          setError(true);
          setMessage(response.error);
        } else {
          setLoading(false);
          setDisable(false);
          setError(true);
          setMessage("An unknown error occured!");
        }
      } catch (error: any) {
        console.error(error);
        setLoading(false);
        setDisable(false);
        setError(true);
        setMessage("An unknown error occured!");
      }
    }
  }

  return (
    <>
      <div className="">
        <div className="">
          <Image
            src={"/assets/images/bg.png"}
            alt="banner"
            width={100}
            height={100}
            className="w-full h-[150px]"
          />
        </div>
        <div className="">
          <div className="flex items-center justify-center gap-5 mb-[5rem]">
            <div className="">
              <Image
                src={"/assets/images/profilepic.png"}
                alt="banner"
                width={50}
                height={50}
                className="rounded-full border-8 border-[#23283A]"
              />
            </div>
            <div className="">
              <h2 className="font-bold text-[36px]">{paymentDetails?.title}</h2>
              <p className="text-[16px]">{paymentDetails?.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card2>
              {message ? (
                <p
                  className={`text-center ${
                    error ? "text-red-500" : "text-green-500"
                  } text-[24px]`}
                >
                  {message}
                </p>
              ) : (
                <>
                  <p className="font-bold text-[36px] text-center">
                    Pay with Mileston
                  </p>
                  <div className="mt-10 text-[32px] font-bold w-full flex justify-between items-center">
                    <p>Amount to Pay:</p>
                    <div className="flex items-center">
                      <p>{paymentDetails?.amount}</p>
                      <Image
                        src={"/assets/icons/usdc_icon.svg"}
                        alt="usdc_icon"
                        width={35}
                        height={35}
                      />
                    </div>
                  </div>
                  <div className="mt-[4rem]">
                    <NoOutlineButtonBig
                      type="button"
                      name="Pay with Mileston"
                      onclick={() => setIsModalOpen(true)}
                      loading={loading}
                      disabled={disable}
                    />
                  </div>
                </>
              )}
            </Card2>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <form onSubmit={handleFormSubmit} className="w-full mx-auto">
          <p className="text-[32px] font-bold text-center mb-10">
            Enter Secret Phrase
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium">Secret Phrase</label>
            <input
              type="password"
              name="secretPhrase"
              value={formData.secretPhrase}
              onChange={handleChange}
              placeholder="*****"
              className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${
                errors.secretPhrase ? "border-red-500" : "border-[#979EB8]"
              } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
            />
            {errors.secretPhrase && (
              <p className="text-red-500 text-sm mt-1">{errors.secretPhrase}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Any other Information
            </label>
            <input
              type="text"
              name="customerInfo"
              value={formData.customerInfo}
              onChange={handleChange}
              placeholder="*****"
              className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${
                errors.secretPhrase ? "border-red-500" : "border-[#979EB8]"
              } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
            />
            {errors.secretPhrase && (
              <p className="text-red-500 text-sm mt-1">{errors.secretPhrase}</p>
            )}
          </div>
          <NoOutlineButtonBig type="submit" name="Continue" />
        </form>
      </Modal>
    </>
  );
}
