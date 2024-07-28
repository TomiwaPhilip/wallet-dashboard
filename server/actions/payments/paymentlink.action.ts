"use server";

import connectToDB from "@/server/model/database";
import getSession from "../server-hooks/getsession.action";
import PaymentLinkModel from "@/server/schemas/paymentLink"; // Adjust the import according to your project structure
import {
  SendFundsToWalletParams,
  sendFundsToWallet,
} from "../transactions/send.action";
import User from "@/server/schemas/user";
import Wallet from "@/server/schemas/wallet";

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
  params: CreateOrUpdatePaymentLinkParams
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
      const existingPaymentLink = await PaymentLinkModel.findById(
        paymentLinkId
      );

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

export interface PaymentLinkFormDetails {
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

export interface PaymentDetails extends PaymentLinkFormDetails {
  receiverUserEmail: string;
  identifier: string;
}

export async function getPaymentDetailsById(
  paymentLinkId: string,
  forPayment?: boolean
) {
  await connectToDB();

  try {
    // Determine which fields to select based on the forPayment parameter
    const selectFields = forPayment
      ? "-_id -payerUser -createdAt -updatedAt"
      : "-_id -receiverUser -payerUser -createdAt -updatedAt";

    const paymentDetails: any = await PaymentLinkModel.findById(paymentLinkId)
      .select(selectFields)
      .lean(); // Convert to a plain JavaScript object

    if (!paymentDetails) {
      throw new Error("Payment link not found");
    }

    // Return the data in the format expected based on forPayment
    if (forPayment) {
      const user: any = await User.findById(paymentDetails.receiverUser);
      const wallet: any = await Wallet.findOne({
        user: paymentDetails.receiverUser,
      });
      return {
        amount: paymentDetails.amount || '',
        title: paymentDetails.title || '',
        description: paymentDetails.description || '',
        redirectUrl: paymentDetails.redirectUrl || '',
        customerInfo: paymentDetails.customerInfo || '',
        bannerImage: paymentDetails.bannerImage || '',
        logoImage: paymentDetails.logoImage || '',
        backgroundColor: paymentDetails.backgroundColor || '',
        foregroundColor: paymentDetails.foregroundColor || '',
        textColor: paymentDetails.textColor || '',
        buttonColor: paymentDetails.buttonColor || '',
        receiverUser: user.email || "",
        identifier: wallet.solanaPublicKey || "",
      };
    } else {
      return {
        amount: paymentDetails.amount || '',
        title: paymentDetails.title || '',
        description: paymentDetails.description || '',
        redirectUrl: paymentDetails.redirectUrl || '',
        customerInfo: paymentDetails.customerInfo || '',
        bannerImage: paymentDetails.bannerImage || '',
        logoImage: paymentDetails.logoImage || '',
        backgroundColor: paymentDetails.backgroundColor || '',
        foregroundColor: paymentDetails.foregroundColor || '',
        textColor: paymentDetails.textColor || '',
        buttonColor: paymentDetails.buttonColor || '',
      };
    }
  } catch (error: any) {
    console.error("Error getting payment details from DB:", error.message);
    throw new Error("Failed to get payment details");
  }
}

interface PayUser extends SendFundsToWalletParams {
  paymentLinkId: string;
  customerInfo?: string;
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
        {
          $push: {
            payerUser: session.userId,
            customerInfo: params.customerInfo,
          },
        }, // Ensure payerUser is updated as an array
        { new: true } // Return the updated document
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
