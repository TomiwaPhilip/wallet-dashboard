"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import EmailForm from "@/components/forms/EmailFom";
import GoogleButton from "@/components/shared/buttons";
import { editCallbackUrl } from "@/server/actions/server-hooks/getsession.action";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    if (callbackUrl) {
      const updateCallbackUrl = async () => {
        try {
          await editCallbackUrl(callbackUrl);
          console.log("Callback URL updated successfully");
        } catch (error) {
          console.error("Failed to update callback URL", error);
        }
      };
      updateCallbackUrl();
    }
  }, [callbackUrl]);

  return (
    <div className="text-center">
      <h1 className="font-bold text-[36px]">Sign to your Account</h1>
      <p className="font-regular text-[16px]">
        Enter your email address to continue to Mileston
      </p>
      <EmailForm />
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-[#E6E6E6]"></div>
        <span className="mx-4 text-[#828282]">or continue with</span>
        <div className="flex-grow border-t border-[#E6E6E6]"></div>
      </div>
      <GoogleButton />
      <p className="text-[16px] p-5 font-regular">
        By clicking continue, you agree to our{" "}
        <span className="text-[#263382]"> Terms of Service </span> and{" "}
        <span className="text-[#263382]"> Privacy Policy </span>
      </p>
    </div>
  );
}
