import { NoOutlineButtonBig } from "@/components/shared/buttons";
import { Card2 } from "@/components/shared/shared";
import { PaymentLinkFormDetails } from "@/server/actions/payments/paymentlink.action";
import Image from "next/image";

export default function PaymentPageComp(params: PaymentLinkFormDetails) {
  const {
    backgroundColor = "#0A0C13",
    textColor = "#FFFFFF",
    bannerImage = "/assets/images/bg.png",
    logoImage = "/assets/images/profilepic.png",
    title = "Default Title",
    description = "Default Description",
    foregroundColor = "#FFFFFF",
    amount = "0.00",
    buttonColor = "#000000",
  } = params || {};

  // Function to validate hex color and provide a fallback if invalid
  const validateHexColor = (color) => {
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    return hexColorRegex.test(color) ? color : null;
  };

  const validatedBackgroundColor = validateHexColor(backgroundColor) || "#0A0C13";
  const validatedTextColor = validateHexColor(textColor) || "#FFFFFF";
  const validatedForegroundColor = validateHexColor(foregroundColor) || "#FFFFFF";
  const validatedButtonColor = validateHexColor(buttonColor) || "#000000";

  return (
    <div
      style={{ backgroundColor: validatedBackgroundColor, color: validatedTextColor }}
      className="rounded-3xl"
    >
      <div>
        <Image
          src={bannerImage || "/assets/images/bg.png"}
          alt="banner"
          width={100}
          height={100}
          className="w-full h-[150px] rounded-t-3xl"
        />
      </div>
      <div>
        <div className="flex items-center justify-center gap-5 mb-[5rem]">
          <div>
            <Image
              src={logoImage || "/assets/images/profilepic.png"}
              alt="logo"
              width={50}
              height={50}
              className="rounded-full border-8 border-[#23283A]"
            />
          </div>
          <div>
            <h2 className="font-bold text-[36px]">{title}</h2>
            <p className="text-[16px]">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Card2 bgColor={validatedForegroundColor}>
            <p className="font-bold text-[36px] text-center">
              Pay with Mileston
            </p>
            <div className="mt-10 text-[32px] font-bold w-full flex justify-between items-center">
              <p>Amount to Pay:</p>
              <div className="flex items-center">
                <p>{amount}</p>
                <Image
                  src="/assets/icons/usdc_icon.svg"
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
                btnColor={validatedButtonColor}
              />
            </div>
          </Card2>
        </div>
      </div>
    </div>
  );
}
