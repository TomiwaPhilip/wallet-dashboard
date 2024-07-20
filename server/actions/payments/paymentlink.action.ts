"use server";

import connectToDB from "@/server/model/database";
import getSession from "../server-hooks/getsession.action";
import PaymentLinkModel from "@/server/schemas/paymentLink"; // Adjust the import according to your project structure
import {
  SendFundsToWalletParams,
  sendFundsToWallet,
} from "../transactions/send.action";

interface CreateOrUpdatePaymentLinkParams {
  paymentLinkId?: string;
  amount: string;
  title: string;
  description?: string;
  redirectUrl?: string;
  customerInfo?: string;
  bannerImage?: string;
  logoImage?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  textColor?: string;
  buttonColor?: string;
}

export async function createOrUpdatePaymentLink(
  params: CreateOrUpdatePaymentLinkParams,
) {
  await connectToDB();

  const session = await getSession();

  if (!session || !session.userId) {
    throw new Error("Unauthorized access");
  }

  try {
    const { paymentLinkId, ...updateParams } = params;

    if (paymentLinkId) {
      // Update existing payment link
      const existingPaymentLink =
        await PaymentLinkModel.findById(paymentLinkId);

      if (!existingPaymentLink) {
        throw new Error("Payment link not found");
      }

      if (existingPaymentLink.receiverUser.toString() !== session.userId) {
        throw new Error("Unauthorized to update this payment link");
      }

      Object.assign(existingPaymentLink, updateParams);
      await existingPaymentLink.save();

      return { message: "Payment link updated successfully!" };
    } else {
      // Create new payment link
      const newPaymentLink = new PaymentLinkModel({
        ...updateParams,
        receiverUser: session.userId,
        createdAt: new Date(),
        status: "pending",
      });

      await newPaymentLink.save();

      return { message: "Payment link created successfully!" };
    }
  } catch (error: any) {
    console.error("Error creating or updating payment link:", error.message);
    throw new Error("Failed to create or update payment link");
  }
}

export async function getPaymentDetailsById(paymentLinkId: string) {
  await connectToDB();

  try {
    // Select only necessary fields and exclude _id, receiverUser, payerUser, and timestamps
    const paymentDetails = await PaymentLinkModel.findById(paymentLinkId)
      .select("-_id -receiverUser -payerUser -createdAt -updatedAt")
      .lean(); // Convert to a plain JavaScript object

    if (!paymentDetails) {
      throw new Error("Payment link not found");
    }

    if (paymentDetails.status === "expired") {
      return { error: "Payment Link has expired" };
    } else {
      return paymentDetails;
    }
  } catch (error: any) {
    console.error("Error getting payment details from DB:", error.message);
    throw new Error("Failed to get payment details");
  }
}

interface PayUser extends SendFundsToWalletParams {
  paymentLinkId: string;
}

export async function payUser(params: PayUser) {
  await connectToDB();

  const session = await getSession();

  if (!session || !session.userId || !session.solanaAddress) {
    throw new Error("User not authorized to make payments");
  }

  try {
    const response = await sendFundsToWallet({
      identifier: params.identifier,
      secretPhrase: params.secretPhrase,
      amount: params.amount,
    });

    if (response.message) {
      const updatePayment = await PaymentLinkModel.findByIdAndUpdate(
        params.paymentLinkId,
        { $push: { payerUser: session.userId } }, // Ensure payerUser is updated as an array
        { new: true }, // Return the updated document
      );

      if (updatePayment) {
        return { message: response.message };
      } else {
        return { error: "Error saving updating payment link in DB" };
      }
    } else if (response.error) {
      return { error: response.error };
    }
  } catch (error: any) {
    console.error("Error making payment:", error.message);
    return {
      error: "Unable to make payments at the moment. Please try again later.",
    };
  }
}
