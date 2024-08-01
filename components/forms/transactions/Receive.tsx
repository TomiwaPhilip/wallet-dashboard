import { NoOutlineButtonIcon } from "@/components/shared/buttons";
import QrCodeGenerator from "./QRcodeGenerator";
import { useSession } from "@/components/shared/session";
import { useRef, useState } from "react";
import { Props } from "./QRcodeGenerator";

interface QRProps extends Props {
    caption: string;
}

const Receive: React.FC<QRProps> = ({caption, value}: QRProps) => {

    const [copy, setCopy] = useState('/assets/icons/content_copy.svg');
    const secretRef = useRef<HTMLParagraphElement>(null);

    const copyToClipboard = () => {
        if (secretRef.current) {
            navigator.clipboard.writeText(secretRef.current.innerText)
                .then(() => {
                    console.log('Text copied to clipboard');
                    setCopy('/assets/icons/bookmark_check.svg');
                    setTimeout(() => {
                        setCopy('/assets/icons/content_copy.svg');
                    }, 2000); // Reset after 2 seconds (adjust duration as needed)
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    setCopy('Failed to copy!');
                    setTimeout(() => {
                        setCopy('/assets/icons/content_copy.svg');
                    }, 2000); // Reset after 2 seconds (adjust duration as needed)
                });
        }
    };

    return (
        <>
            <p className="text-center font-bold text-[24px] mb-4">
                {caption}
            </p>
            <div className="">
                <QrCodeGenerator value={value} />
                <p className="text-center text-[16px] font-bold my-2">Scan QR Code to Copy</p>
            </div>
            <p ref={secretRef} className="hidden">{value}</p>
            <div className="flex items-center justify-center mt-6">
                <NoOutlineButtonIcon
                    name={value}
                    type="submit"
                    iconSrc={copy}
                    buttonClassName="w-full text-sm"
                    onClick={copyToClipboard}
                />
            </div>
        </>
    );
};

export default Receive;
