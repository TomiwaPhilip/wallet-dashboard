"use client";

import React from "react";
import { RiLoader4Line } from "react-icons/ri";
import { handleGoogleLogin } from "@/lib/actions/login.action";

const GoogleButton: React.FC = () => {
  return (
    <button
      onClick={() => handleGoogleLogin()}
      className="flex items-center justify-center w-full py-2 px-4 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <img
        src="/assets/icons/Google.svg"
        alt="google_icon"
        width={30}
        height={30}
        className="mr-4"
      />
      Continue with Google
    </button>
  );
};

export default GoogleButton;

export function NoOutlineButtonBig({
  name,
  type,
  disabled,
  loading,
  onclick,
}: {
  name: string;
  type: "submit" | "button";
  disabled?: boolean;
  loading?: boolean;
  onclick?: () => void;
}) {
  return (
    <button
      type={type}
      className="mt-5 w-full bg-[#263382] rounded-lg py-4 flex items-center justify-center text-center"
      disabled={disabled}
      onClick={onclick}
    >
      {loading ? <RiLoader4Line className="animate-spin text-2xl" /> : name}
    </button>
  );
}
