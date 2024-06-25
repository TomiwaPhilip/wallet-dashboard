"use client";

import { useEffect, useState, useRef } from "react";
import { NoOutlineButtonBig } from "../shared/buttons";
import Link from "next/link";

interface SecretPageProps {
    secret: string;
}

export default function SecretPage({ secret }: SecretPageProps) {
    const [disabled, setDisabled] = useState(true);
    const [copy, setCopy] = useState('Copy to Clipboard');
    const secretRef = useRef<HTMLParagraphElement>(null);

    const copyToClipboard = () => {
        if (secretRef.current) {
            navigator.clipboard.writeText(secretRef.current.innerText)
                .then(() => {
                    console.log('Text copied to clipboard');
                    setCopy('Copied!');
                    setDisabled(false);
                    setTimeout(() => {
                        setCopy('Copy to Clipboard');
                        setDisabled(false);
                    }, 2000); // Reset after 2 seconds (adjust duration as needed)
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    setCopy('Failed to copy!');
                    setDisabled(false);
                    setTimeout(() => {
                        setCopy('Copy to Clipboard');
                        setDisabled(false);
                    }, 2000); // Reset after 2 seconds (adjust duration as needed)
                });
        }
    };

    return (
        <div className="">
            <h2 className="text-center text-[32px] font-bold mb-4">Your Mileston Wallet has been created!</h2>
            <p className="text-center text-[16px] text-[#E40686] mb-4">Copy the below phrases and save them properly. If you lose them,
                you will not be able to perform any transaction and your Mileston
                wallet will be lost. Mileston will not be responsible for the loss
                of these phrases or any loss of assets as a result thereof.
                Click on copy and save it somewhere safe before clicking on continue button.
            </p>
            <p ref={secretRef} className="text-center italic">{secret}</p>
            <NoOutlineButtonBig
                type="button"
                name={copy}
                onclick={copyToClipboard}
            />
            <Link href="/">
                <NoOutlineButtonBig
                    type="button"
                    name="I have Copied it. Continue."
                    disabled={disabled}
                />
            </Link>
        </div>
    );
}
