"use client";

import { useEffect, useState, useRef } from "react";
import { NoOutlineButtonBig } from "../shared/buttons";

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
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    setCopy('Failed to copy!');
                });
        }
    };

    return (
        <div className="">
            <h2>Your Mileston Wallet has been created</h2>
            <p>Copy the below phrases and save them properly. If you lose them, 
                you will not be able to perform any transaction and your Mileston 
                wallet will be lost. Mileston will not be responsible for the loss 
                of these phrases or any loss of assets as a result thereof.
                Click on copy and save it somewhere safe before clicking on continue button.
            </p>
            <p ref={secretRef}>{secret}</p>
            <NoOutlineButtonBig 
                type="button" 
                name={copy} 
                onclick={copyToClipboard} 
            />
            <NoOutlineButtonBig 
                type="button" 
                name="I have Copied it. Continue." 
                disabled={disabled} 
            />
        </div>
    );
}
