import { NoOutlineButtonBig } from "@/components/shared/buttons";
import { Card2 } from "@/components/shared/shared";
import { PaymentLinkFormDetails } from "@/server/actions/payments/paymentlink.action";
import Image from "next/image";

export default function PaymentPageComp(params: PaymentLinkFormDetails) {
  return (
    <div
      className={`${params?.backgroundColor || "bg-[#0A0C13]"} ${
        params?.textColor || "text-white`"
      }`}
    >
      <div className="">
        <Image
          src={params?.bannerImage || "/assets/images/bg.png"}
          alt="banner"
          width={100}
          height={100}
          className="w-full h-[150px]"
        />
      </div>
      <div className="">
        <div className="flex items-center justify-center gap-5 mb-[5rem]">
          <div className="">
            <Image
              src={params?.logoImage || "/assets/images/profilepic.png"}
              alt="banner"
              width={50}
              height={50}
              className="rounded-full border-8 border-[#23283A]"
            />
          </div>
          <div className="">
            <h2 className="font-bold text-[36px]">{params?.title}</h2>
            <p className="text-[16px]">{params?.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Card2 bgColor={params?.foregroundColor}>
            <p className="font-bold text-[36px] text-center">
              Pay with Mileston
            </p>
            <div className="mt-10 text-[32px] font-bold w-full flex justify-between items-center">
              <p>Amount to Pay:</p>
              <div className="flex items-center">
                <p>{params?.amount}</p>
                <Image
                  src={"/assets/icons/usdc_icon.svg"}
                  alt="usdc_icon"
                  width={35}
                  height={35}
                />
              </div>
            </div>
            <div className="mt-[4rem]">
              <NoOutlineButtonBig
                type="button"
                name="Pay with Mileston"
                disabled={true}
                btnColor={params?.buttonColor}
              />
            </div>
          </Card2>
        </div>
      </div>
    </div>
  );
}
