"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NoOutlineButtonBig } from "../shared/buttons";
import { useSession } from "../shared/session";
import { deleteMnemonic } from "@/server/actions/auth/login.action";
import { StatusMessage } from "../shared/shared";

interface SecretPageProps {
  secret: string;
}

export default function SecretPage({ secret }: SecretPageProps) {
  const [disabled, setDisabled] = useState(true);
  const [copy, setCopy] = useState("Copy to Clipboard");
  const secretRef = useRef<HTMLParagraphElement>(null);
  const [url, setUrl] = useState("/");
  const session = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (session?.callbackUrl) {
      setUrl(session.callbackUrl);
    }
  }, [session?.callbackUrl]);

  const copyToClipboard = () => {
    if (secretRef.current) {
      navigator.clipboard
        .writeText(secretRef.current.innerText)
        .then(() => {
          console.log("Text copied to clipboard");
          setCopy("Copied!");
          setDisabled(false);
          setTimeout(() => {
            setCopy("Copy to Clipboard");
            setDisabled(false);
          }, 2000); // Reset after 2 seconds (adjust duration as needed)
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          setCopy("Failed to copy!");
          setDisabled(true);
          setTimeout(() => {
            setCopy("Copy to Clipboard");
            setDisabled(true);
          }, 2000); // Reset after 2 seconds (adjust duration as needed)
        });
    }
  };

  const handleContinue = async () => {
    // Call your function here
    console.log("User has confirmed copying the secret");

    const response = await deleteMnemonic()

    if (response && response.message === true) {
      // Then navigate to the next page
      router.push(url);
    } else {
      setIsError(true);
      setError(response.error);
    }

  };

  return (
    <>
      <div className="">
        <h2 className="text-center text-[32px] font-bold mb-4">
          Your Mileston Wallet has been created!
        </h2>
        <p className="text-center text-[16px] text-[#E40686] mb-4">
          Copy the below phrases and save them properly. If you lose them, you
          will not be able to perform any transaction and your Mileston wallet
          will be lost. Mileston will not be responsible for the loss of these
          phrases or any loss of assets as a result thereof. Click on copy and
          save it somewhere safe before clicking on continue button.
        </p>
        <p ref={secretRef} className="text-center italic">
          {secret}
        </p>
        <NoOutlineButtonBig type="button" name={copy} onclick={copyToClipboard} />
        <NoOutlineButtonBig
          type="button"
          name="I have Copied it. Continue."
          disabled={disabled}
          onclick={handleContinue}
        />
      </div>
      {isError === true && (
        <StatusMessage type="error" message={error} />
      )}
    </>
  );
}
