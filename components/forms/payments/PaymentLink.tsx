import {
  NoOutlineButtonBig,
  NoOutlineButtonIcon,
} from "@/components/shared/buttons";
import React, { ChangeEvent, useEffect, useState } from "react";
import PaymentPageComp from "./PaymentPageComp";
import { createOrUpdatePaymentLink, getPaymentDetailsById, PaymentDetails, PaymentLinkFormDetails } from "@/server/actions/payments/paymentlink.action";
import Modal from "@/components/shared/Modal";
import Receive from "../transactions/Receive";
import { StatusMessage } from "@/components/shared/shared";
import { upload } from "@vercel/blob/client";


interface PaymentLinkProps {
  id?: string; // Optional id prop
}

interface ErrorResponse {
  error: string;
}

type ResponseData = PaymentLinkFormDetails | PaymentDetails | ErrorResponse;

function isPaymentLinkFormDetails(data: ResponseData): data is PaymentLinkFormDetails {
  return (data as PaymentLinkFormDetails).customerInfo !== undefined;
}

function isPaymentDetails(data: ResponseData): data is PaymentDetails {
  return (data as PaymentDetails).customerInfo !== undefined && (data as PaymentDetails).description !== undefined;
}

const PaymentLink: React.FC<PaymentLinkProps> = ({ id }: PaymentLinkProps) => {
  const [formData, setFormData] = useState<PaymentLinkFormDetails>({
    amount: "0",
    title: "Title",
    description: "Description",
    redirectUrl: "", // Initialize as empty string or undefined based on your logic
    customerInfo: "yes",
    bannerImage: "", // Initialize optional fields as empty string or undefined
    logoImage: "",
    backgroundColor: "#0A0C13",
    foregroundColor: "#0e1018",
    textColor: "#ffffff",
    buttonColor: "#263382",
  });

  const [errors, setErrors] = useState<Partial<PaymentLinkFormDetails>>({});

  const [showCustomization, setShowCustomization] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState<boolean | null>(false);
  const [loading, setLoading] = useState(false);
  const [btnName, setBtnName] = useState("Create Payment Link");
  const [paymentLink, setPaymentLink] = useState("");
  const [imageState, setImageState] = useState('Upload');
  const [imageState2, setImageState2] = useState('Upload');

  // Function to handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(null);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>, logo: boolean) => {
    e.preventDefault();

    setLoading(true);

    if (logo) {
      setImageState('Uploading');
    } else {
      setImageState2('Uploading');
    }

    const file = e.target.files?.[0];
    if (!file) {
      setLoading(false);
      if (logo) {
        setImageState('No file selected');
      } else {
        setImageState2('No file selected');
      }
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const fileData = e.target?.result;
      if (typeof fileData === "string") {
        try {
          const newBlob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/avatar/upload",
          });
          if (newBlob.url) {

            if (logo) {
              setFormData({ ...formData, ['logoImage']: newBlob.url });
            } else {
              setFormData({ ...formData, ['bannerImage']: newBlob.url });
            }

            setLoading(false);
            if (logo) {
              setImageState('Successfully Uploaded');
            } else {
              setImageState2('Successfully Uploaded');
            }
          }
        } catch (error) {
          setLoading(false);
          if (logo) {
            setImageState('Error Uploading');
          } else {
            setImageState2('Error Uploading');
          }
          console.error("Error uploading file:", error);
        }
      }
    };
    fileReader.readAsDataURL(file);
  };


  // Fetch invoice details if id is provided
  useEffect(() => {
    if (id) {
      const fetchInvoiceData = async () => {
        try {
          const data: ResponseData = await getPaymentDetailsById(id);
          setBtnName("Edit Payment Link")

          console.log(data);

          if (isPaymentLinkFormDetails(data)) {
            setFormData({
              amount: data.amount,
              title: data.title,
              description: data.description,
              redirectUrl: data.redirectUrl,
              customerInfo: data.customerInfo,
              bannerImage: data.bannerImage,
              logoImage: data.logoImage,
              backgroundColor: data.backgroundColor,
              foregroundColor: data.foregroundColor,
              textColor: data.textColor,
              buttonColor: data.buttonColor,
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

  const handleToggleCustomization = () => {
    setShowCustomization(!showCustomization);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = (): boolean => {
    const newErrors: Partial<PaymentLinkFormDetails> = {};

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Amount must be a number";
    }

    if (!formData.title) {
      newErrors.title = "Title is required";
    }

    if (!formData.description) {
      newErrors.description = "Description is required";
    }

    if (formData.redirectUrl) {
      if (!/^https?:\/\//.test(formData.redirectUrl)) {
        newErrors.redirectUrl = "Redirect URL must be a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const response = await createOrUpdatePaymentLink({
          amount: formData.amount,
          title: formData.title,
          description: formData.description,
          redirectUrl: formData.redirectUrl,
          customerInfo: formData.customerInfo,
          bannerImage: formData.bannerImage,
          logoImage: formData.logoImage,
          backgroundColor: formData.backgroundColor,
          foregroundColor: formData.foregroundColor,
          textColor: formData.textColor,
          buttonColor: formData.buttonColor,
          paymentLinkId: id,
        });
        if (response) {
          setLoading(false);
          if (response.message) {
            setError(false);
            setMessage(response.message);
            setPaymentLink(response.paymentLink)
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
        <h2 className="text-[32px] font-bold">Create a Payment Link</h2>
        <p className="text-[16px] font-medium">
          Enter the below information to create a payment link
        </p>

        <div className="flex flex-col items-start space-x-10 mt-10 lg:flex-row lg:items-center">
          <div className="w-full lg:w-1/2">
            <form onSubmit={handleSubmit} className="mt-10 w-full">
              <div className="mb-4">
                <label className="block text-sm font-medium">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  placeholder="12,000.00"
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.amount ? "border-red-500" : "border-[#979EB8]"
                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  placeholder="Title"
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.title ? "border-red-500" : "border-[#979EB8]"
                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  placeholder="Description"
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.description ? "border-red-500" : "border-[#979EB8]"
                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">Redirect URL</label>
                <input
                  type="text"
                  name="redirectUrl"
                  value={formData.redirectUrl}
                  placeholder="https://example.com"
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.redirectUrl ? "border-red-500" : "border-[#979EB8]"
                    } rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                />
                {errors.redirectUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.redirectUrl}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Any other information from customer?
                </label>
                <select
                  name="customerInfodcNetwork"
                  value={formData.customerInfo}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-[#131621] border-[#979EB8] rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]`}
                >
                  <option value="nil" disabled>
                    Select
                  </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Toggle for customization options */}
              <p
                className="cursor-pointer text-sm my-4"
                onClick={handleToggleCustomization}
              >
                Customization Options
              </p>

              {/* Customization options */}
              {showCustomization && (
                <div>
                  <div className="mb-4">
                    <label
                      htmlFor="bannerUpload"
                      className="block text-sm font-bold text-[#3344A8] cursor-pointer"
                    >
                      {imageState2} a banner
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      name="bannerImage"
                      id="bannerUpload"
                      onChange={(e) => handleImageChange(e, false)}
                      className="mt-1 block hidden px-3 py-2 bg-[#131621] border border-[#979EB8] rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="logoUpload"
                      className="block text-sm text-[#3344A8] font-bold cursor-pointer"
                    >
                      {imageState} your logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      name="logoImage"
                      id="logoUpload"
                      onChange={(e) => handleImageChange(e, true)}
                      className="mt-1 block hidden px-3 py-2 bg-[#131621] border border-[#979EB8] rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]"
                    />
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="color"
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleColorChange}
                        className="w-9 h-9 rounded-lg border-[0.5px] border-gray-300 ml-2 cursor-pointer"
                      />
                      <label className="block text-sm font-medium">
                        Background Color
                      </label>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="color"
                        name="foregroundColor"
                        value={formData.foregroundColor}
                        onChange={handleColorChange}
                        className="w-9 h-9 rounded-lg border-[0.5px] border-gray-300 ml-2 cursor-pointer"
                      />
                      <label className="block text-sm font-medium">
                        Foreground color
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="color"
                        name="textColor"
                        value={formData.textColor}
                        onChange={handleColorChange}
                        className="w-9 h-9 rounded-lg border-[0.5px] border-gray-300 ml-2 cursor-pointer"
                      />
                      <label className="block text-sm font-medium">
                        Text Color
                      </label>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="color"
                        name="buttonColor"
                        value={formData.buttonColor}
                        onChange={handleColorChange}
                        className="w-9 h-9 rounded-lg border-[0.5px] border-gray-300 ml-2 cursor-pointer"
                      />
                      <label className="block text-sm font-medium mr-4">
                        Button Color
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <NoOutlineButtonIcon
                name={btnName}
                type="submit"
                iconSrc="/assets/icons/add_diamond.svg"
                buttonClassName="mt-6"
                loading={loading}
                disabled={loading}
              />
            </form>
          </div>

          {/* Divider */}
          <div className="hidden lg:block">
            <div className="w-px bg-[#464D67] h-[90vh]"></div>
          </div>

          {/* Live Preview Component */}
          <div className="hidden lg:block">
            <div className="w-1/2 p-4 bg-[#B5B5B5] rounded-3xl">
              <PaymentPageComp
                amount={formData.amount}
                title={formData.title}
                buttonColor={formData.buttonColor}
                backgroundColor={formData.backgroundColor}
                textColor={formData.textColor}
                foregroundColor={formData.foregroundColor}
                description={formData.description}
                logoImage={formData.logoImage}
                bannerImage={formData.bannerImage}
              />
            </div>
          </div>

        </div>
      </div>
      {error === true && (
        <StatusMessage type="error" message={message} />
      )}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Receive value={paymentLink} caption={message} />
      </Modal>
    </>
  );
};

export default PaymentLink;
