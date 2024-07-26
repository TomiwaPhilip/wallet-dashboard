"use client";

import Image from "next/image";
import { Card2 } from "../shared/shared";
import { NoOutlineButtonBig } from "../shared/buttons";
import { useSession } from "../shared/session";

interface Props {
    invoiceId: string;
    customerEmail: string;
    status: string;
    amountDue: string;
}

export default function InvoicePage({ invoiceId, customerEmail, status, amountDue }: Props) {
    const session = useSession();

    const receivingUser = session?.email;

    return (
        <div className="">
            <h1 className="font-bold text-[32px]">Invoice from {receivingUser}</h1>

            <div className="mt-[5rem] flex justify-between w-full gap-10">
                <div className="flex-1">
                    <div className="mb-10">
                        <h3 className="text-[20px] text-[#3344A8] mb-3">From:</h3>
                        <h2 className="text-[24px]">{receivingUser}</h2>
                    </div>
                    <div className="mb-10">
                        <h3 className="text-[20px] text-[#3344A8] mb-3">Billed To:</h3>
                        <h2 className="text-[24px]">{customerEmail}</h2>
                    </div>
                    <div className="mb-10">
                        <h3 className="text-[20px] text-[#3344A8] mb-3">Status:</h3>
                        <h2 className="text-[24px]">{status}</h2>
                    </div>
                </div>
                <div className="flex-1">
                    <Card2>
                        <p className="font-bold text-[36px] text-center">Pay with Mileston</p>
                        <div className="mt-10 text-[32px] font-bold w-full flex justify-between items-center">
                            <p>Amount to Pay:</p>
                            <div className="flex items-center">
                                <p>{amountDue}</p>
                                <Image
                                    src={"/assets/icons/usdc_icon.svg"}
                                    alt="usdc_icon"
                                    width={35}
                                    height={35}
                                />
                            </div>
                        </div>
                        <div className="mt-[4rem]">
                            <NoOutlineButtonBig type="button" name="Pay with Mileston" />
                        </div>
                    </Card2>
                </div>
            </div>
        </div>
    )
}
