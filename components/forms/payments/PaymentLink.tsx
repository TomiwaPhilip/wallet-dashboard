import {
  NoOutlineButtonBig,
  NoOutlineButtonIcon,
} from "@/components/shared/buttons";
import React, { useState } from "react";
import PaymentPageComp from "./PaymentPageComp";
import { PaymentLinkFormDetails } from "@/server/actions/payments/paymentlink.action";

const PaymentLink: React.FC = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Submit form data
      console.log("Form submitted:", formData);
    }
  };

  return (
    <div className="py-[4rem] px-[6rem]">
      <h2 className="text-[32px] font-bold">Create a Payment Link</h2>
      <p className="text-[16px] font-medium">
        Enter the below information to create a payment link
      </p>

      <div className="flex items-center space-x-10 mt-10">
        <div className="w-1/2">
          <form onSubmit={handleSubmit} className="mt-10">
            <div className="mb-4">
              <label className="block text-sm font-medium">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                placeholder="12,000.00"
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${
                  errors.amount ? "border-red-500" : "border-[#979EB8]"
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
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${
                  errors.title ? "border-red-500" : "border-[#979EB8]"
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
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${
                  errors.description ? "border-red-500" : "border-[#979EB8]"
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
                className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${
                  errors.redirectUrl ? "border-red-500" : "border-[#979EB8]"
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
                    Upload a banner
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="bannerImage"
                    id="bannerUpload"
                    onChange={handleChange}
                    className="mt-1 block hidden px-3 py-2 bg-[#131621] border border-[#979EB8] rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8] placeholder:text-[#464D67]"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="logoUpload"
                    className="block text-sm text-[#3344A8] font-bold cursor-pointer"
                  >
                    Upload your logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="logoImage"
                    id="logoUpload"
                    onChange={handleChange}
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
              name="Create Payment Link"
              type="submit"
              iconSrc="/assets/icons/add_diamond.svg"
              buttonClassName="mt-6"
            />
          </form>
        </div>

        {/* Divider */}
        <div className="w-px bg-[#464D67] h-[70vh]"></div>

        {/* Live Preview Component */}
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
  );
};

export default PaymentLink;
