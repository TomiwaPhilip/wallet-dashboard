"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card2 } from "../shared/shared";
import { NoOutlineButtonBig } from "../shared/buttons";
import { getInvoiceDetailsById, payInvoice } from "@/server/actions/payments/invoice.action";
import { useSession } from "../shared/session";
import Modal from "../shared/Modal";

interface PaymentDetails {
    amountDue: string;
    customerEmail: string;
    status?: string;
    receiverUser: string;
    identifier: string;
}

interface InvoiceDetails {
    amountDue: string;
    itemName: string;
    dueDate: string;
    customerEmail: string;
    status?: string; // Include status if needed for checking
}

interface ErrorResponse {
    error: string;
}

interface Props {
    invoiceId: string;
}

interface FormData {
    secretPhrase: string;
}

type ResponseData = InvoiceDetails | PaymentDetails | ErrorResponse;

function isPaymentDetails(data: ResponseData): data is PaymentDetails {
    return (data as PaymentDetails).amountDue !== undefined && (data as PaymentDetails).customerEmail !== undefined;
}

// Type guard to check if the response is an error
function isErrorResponse(response: any): response is ErrorResponse {
    return response && typeof response.error === 'string';
}

export default function InvoicePage({ invoiceId }: Props) {
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [formData, setFormData] = useState<FormData>({ secretPhrase: "" });
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
                const data = await getInvoiceDetailsById(invoiceId, true);

                if (isErrorResponse(data)) {
                    setError(true);
                    setMessage(data.error);
                } else if (isPaymentDetails(data)) {
                    setPaymentDetails(data);
                    if (session?.email === paymentDetails?.receiverUser) {
                        setDisable(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch payment details:", error);
                setError(true);
                setMessage("Failed to fetch payment details.");
            }
        };

        if (invoiceId) {
            fetchPaymentData();
        }
    }, [invoiceId]);

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleCloseModal();
        setError(false);
        setMessage('');
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
                const response = await payInvoice({
                    identifier: paymentDetails?.identifier as string,
                    secretPhrase: formData.secretPhrase,
                    amount: paymentDetails?.amountDue as string,
                    invoiceId: invoiceId
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
                <h1 className="font-bold text-[24px] md:text-[32px]">Invoice from {paymentDetails?.receiverUser}</h1>
                <div className="mt-[5rem] flex flex-col justify-between w-full gap-10 md:flex-row">
                    <div className="flex-1">
                        <div className="mb-10">
                            <h3 className="text-[20px] text-[#3344A8] mb-3">From:</h3>
                            <h2 className="text-[24px]">{paymentDetails?.receiverUser}</h2>
                        </div>
                        <div className="mb-10">
                            <h3 className="text-[20px] text-[#3344A8] mb-3">Billed To:</h3>
                            <h2 className="text-[24px]">{paymentDetails?.customerEmail}</h2>
                        </div>
                        <div className="mb-10">
                            <h3 className="text-[20px] text-[#3344A8] mb-3">Status:</h3>
                            <h2 className="text-[24px]">{paymentDetails?.status}</h2>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Card2>
                            {message ? (
                                <p className={`text-center ${error ? "text-red-500" : "text-green-500"} text-[24px]`}>
                                    {message}
                                </p>
                            ) : (
                                <>
                                    <p className="font-bold text-[24px] md:text-[36px] text-center">Pay with Mileston</p>
                                    <div className="mt-10 text-[20px] md:text-[32px] font-bold w-full flex justify-between items-center">
                                        <p>Amount to Pay:</p>
                                        <div className="flex items-center">
                                            <p>{paymentDetails?.amountDue}</p>
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
                    <p className="text-[32px] font-bold text-center mb-10">Enter Secret Phrase</p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Secret Phrase</label>
                        <input
                            type="password"
                            name="secretPhrase"
                            value={formData.secretPhrase}
                            onChange={handleChange}
                            placeholder="*****"
                            className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.secretPhrase ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                        />
                        {errors.secretPhrase && (
                            <p className="text-red-500 text-sm mt-1">{errors.secretPhrase}</p>
                        )}
                    </div>
                    <NoOutlineButtonBig
                        type="submit"
                        name="Continue"
                    />
                </form>
            </Modal>
        </>
    );
}
