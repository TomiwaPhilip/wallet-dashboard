"use client";

import React, { useState, useEffect } from "react";
import { OutlineButtonSm } from "@/components/shared/buttons";
import { SaveSettings } from "@/lib/actions/auth/settings.action";
import { StatusMessage } from "@/components/shared/shared";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface Props {
  defaultValues?: FormData;
}

const SettingsForm: React.FC<Props> = ({ defaultValues }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: defaultValues?.firstName || "",
    lastName: defaultValues?.lastName || "",
    email: defaultValues?.email || "",
    phoneNumber: defaultValues?.phoneNumber || "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [disable, setDisable] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues);
    }
  }, [defaultValues]);

  const validate = (data: FormData) => {
    const newErrors: Partial<FormData> = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!data.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+\d{1,3}\d{10}$/.test(data.phoneNumber)) {
      newErrors.phoneNumber =
        "Phone number must start with a country code followed by 10 digits";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisable(true);
    setIsSubmitted(false);
    setIsError(false);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log("Form Data Submitted:", formData);

      try {
        const response = await SaveSettings(formData);
        if (response) {
          setIsSubmitted(true);
        } else {
          setIsError(true);
        }
        setErrors({});
      } catch (error) {
        console.error("Error saving settings:", error);
        setIsError(true);
      }
    }

    setDisable(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-7 w-full">
        <div className="mb-4">
          <label className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.firstName ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8]`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.lastName ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8]`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.email ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8]`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 bg-[#131621] border ${errors.phoneNumber ? "border-red-500" : "border-[#979EB8]"} rounded-xl focus:outline-none focus:ring-[#979EB8] focus:border-[#979EB8]`}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
          )}
        </div>
        <div className="flex items-center justify-center">
          <OutlineButtonSm
            name="Save Changes"
            type="submit"
            disabled={disable}
            loading={disable}
          />
        </div>
      </form>
      {isSubmitted === true && (
        <StatusMessage type="success" message="Changes Saved successfully!" />
      )}
      {isError === true && (
        <StatusMessage
          type="error"
          message="Error saving changes. Try again!"
        />
      )}
    </>
  );
};

export default SettingsForm;
