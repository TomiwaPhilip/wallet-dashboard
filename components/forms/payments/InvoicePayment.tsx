import Modal from "@/components/shared/Modal";
import { NoOutlineButtonIcon } from "@/components/shared/buttons";
import { StatusMessage, TransactionMessage } from "@/components/shared/shared";
import { createOrUpdateInvoice, getInvoiceDetailsById } from "@/server/actions/payments/invoice.action";
import { useEffect, useState } from "react";

interface FormData {
    amountDue: string;
    itemName: string;
    dueDate: string;
    email: string;
}

interface InvoicePaymentProps {
    id?: string; // Optional id prop
}

interface InvoiceDetails {
    amountDue: string;
    itemName: string;
    dueDate: string;
    customerEmail: string;
    status?: string; // Include status if needed for checking
}

interface PaymentDetails {
    amountDue: string;
    customerEmail: string;
    status?: string;
    receiverUser: string;
    identifier: string;
}

interface ErrorResponse {
    error: string;
}

type ResponseData = InvoiceDetails | PaymentDetails | ErrorResponse;

function isInvoiceDetails(data: ResponseData): data is InvoiceDetails {
    return (data as InvoiceDetails).itemName !== undefined;
}

function isPaymentDetails(data: ResponseData): data is PaymentDetails {
    return (data as PaymentDetails).amountDue !== undefined && (data as PaymentDetails).customerEmail !== undefined;
}

export default function InvoicePayment({ id }: InvoicePaymentProps) {
    // Define initial empty form data
    const initialFormData: FormData = {
        amountDue: "",
        itemName: "",
        dueDate: "",
        email: "",
    };

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean | null>(false);
    const [btnName, setBtnName] = useState("Create an Invoice")

    // Function to handle modal close
    const handleCloseModal = () => {
        setIsModalOpen(null);
    };

    // Fetch invoice details if id is provided
    useEffect(() => {
        if (id) {
            const fetchInvoiceData = async () => {
                try {
                    const data: ResponseData = await getInvoiceDetailsById(id);
                    setBtnName("Edit Invoice")

                    console.log(data);

                    if (isInvoiceDetails(data)) {
                        setFormData({
                            amountDue: data.amountDue || "",
                            itemName: data.itemName || "",
                            dueDate: data.dueDate || "",
                            email: data.customerEmail || "",
                        });
                    } else if (isPaymentDetails(data)) {
                        // If you need to handle payment details differently, you can do it here
                        console.log("Payment details:", data);
                    } else if ((data as ErrorResponse).error) {
                        setError(true);
                        setMessage((data as ErrorResponse).error);
                    }
                } catch (error) {
                    console.error("Failed to fetch invoice details:", error);
                    setError(true);
                    setMessage("Failed to fetch invoice details.");
                }
            };

            fetchInvoiceData();
        }
    }, [id]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Validate form data
    const validate = () => {
        const newErrors: Partial<FormData> = {};
        let isValid = true;

        if (!formData.amountDue) {
            newErrors.amountDue = "Amount Due is required";
            isValid = false;
        }

        if (!formData.itemName) {
            newErrors.itemName = "Item Name is required";
            isValid = false;
        }

        if (!formData.dueDate) {
            newErrors.dueDate = "Due Date is required";
            isValid = false;
        }

        if (!formData.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            try {
                const response = await createOrUpdateInvoice({
                    amountDue: formData.amountDue,
                    itemName: formData.itemName,
                    customerEmail: formData.email,
                    dueDate: formData.dueDate,
                    invoiceId: id,
                });
                if (response) {
                    setLoading(false);
                    if (response.message) {
                        setError(false);
                        setMessage(response.message);
                        setIsModalOpen(true);
                    } else if (response.error) {
                        setIsModalOpen(false);
                        setMessage(response.error);
                        setError(true);
                    }
                }
            } catch (error: any) {
                console.error(error);
                setLoading(false);
                setMessage("An unknown error occurred!");
                setError(true);
            }
        }
    };

    return (
        <>
            <div className="py-[1rem] px-[1rem] md:py-[2rem] md:px-[3rem] lg:py-[4rem] lg:px-[6rem]">
                <h2 className="text-[32px] font-bold">Create an Invoice</h2>
                <p className="text-[16px] font-medium">
                    Enter the below information to create an invoice
                </p>
                <form onSubmit={handleSubmit} className="space-y-6 mt-10">
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                            <label className="block text-sm font-medium">Amount Due</label>
                            <input
                                type="text"
                                name="amountDue"
                                value={formData.amountDue}
                                placeholder="Amount Due"
                                onChange={handleChange}
                                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.amountDue ? "border-red-500" : "border-[#979EB8]"
                                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                            />
                            {errors.amountDue && (
                                <p className="text-red-500 text-sm mt-1">{errors.amountDue}</p>
                            )}
                        </div>

                        <div className="w-full md:w-1/2 px-3">
                            <label className="block text-sm font-medium">Item Name</label>
                            <input
                                type="text"
                                name="itemName"
                                value={formData.itemName}
                                placeholder="Item Name"
                                onChange={handleChange}
                                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.itemName ? "border-red-500" : "border-[#979EB8]"
                                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                            />
                            {errors.itemName && (
                                <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                            <label className="block text-sm font-medium">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.dueDate ? "border-red-500" : "border-[#979EB8]"
                                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                            />
                            {errors.dueDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                            )}
                        </div>

                        <div className="w-full md:w-1/2 px-3">
                            <label className="block text-sm font-medium">Customer&apos;s Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                placeholder="Customer's Email"
                                onChange={handleChange}
                                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.email ? "border-red-500" : "border-[#979EB8]"
                                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center mt-[5rem]">
                        <NoOutlineButtonIcon
                            name={btnName}
                            type="submit"
                            iconSrc="/assets/icons/add_diamond.svg"
                            buttonClassName="my-3"
                            loading={loading}
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
            {error === true && (
                <StatusMessage type="error" message={message} />
            )}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <TransactionMessage
                    message={message}
                    type={true}
                />
            </Modal>
        </>
    );
}
