import Modal from "@/components/shared/Modal";
import { NoOutlineButtonIcon } from "@/components/shared/buttons";
import { StatusMessage, TransactionMessage } from "@/components/shared/shared";
import { createOrUpdateInvoice } from "@/server/actions/payments/invoice.action";
import { trusted } from "mongoose";
import { useState } from "react";

interface FormData {
    amountDue: string;
    itemName: string;
    dueDate: string;
    email: string;
}

interface InvoicePaymentProps {
    defaultValues?: FormData;
}

export default function InvoicePayment({ defaultValues }: InvoicePaymentProps) {
    const initialFormData: FormData = defaultValues || {
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

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setLoading(true);
            console.log("Form submitted:", formData);
            // Add your submit logic here
            try {
                const response = await createOrUpdateInvoice({
                    amountDue: formData.amountDue,
                    itemName: formData.itemName,
                    customerEmail: formData.email,
                    dueDate: formData.dueDate,
                })
                if (response) {
                    setLoading(false);

                    if (response.message != undefined) {
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
                setMessage("An unknown error occured!")
                setError(true);
            }
        }
    };

    return (
        <>
            <div className="py-[4rem] px-[6rem]">
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
                            <label className="block text-sm font-medium">Customer's Email</label>
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

                    <div className="flex justify-center mt-10">
                        <NoOutlineButtonIcon
                            name="Create an Invoice"
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
