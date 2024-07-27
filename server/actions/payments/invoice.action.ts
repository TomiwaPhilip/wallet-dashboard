"use server";

import connectToDB from "@/server/model/database";
import getSession from "../server-hooks/getsession.action";
import InvoiceModel from "@/server/schemas/invoice";
import User from "@/server/schemas/user";
import { sendInvoiceNotification } from "@/server/utils";
import {
  SendFundsToWalletParams,
  sendFundsToWallet,
} from "../transactions/send.action";
import PaymentLinkModel from "@/server/schemas/paymentLink";
import mongoose from "mongoose";
import { InvoiceBarProps } from "@/components/shared/shared";
import Wallet from "@/server/schemas/wallet";

/**
 * Generates a unique invoice ID starting with 'Mileston-' followed by a random 5-character string.
 * @returns {string} The generated invoice ID.
 */
export async function generateUniqueInvoiceId(): Promise<string> {
  // Function to generate a random 5-character string
  const generateRandomString = (length: number): string => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset[randomIndex];
    }
    return randomString;
  };

  // Generate the unique ID
  const randomString = generateRandomString(5);
  const uniqueInvoiceId = `Mileston-${randomString}`;

  return uniqueInvoiceId;
}

interface CreateOrUpdateInvoiceParams {
  amountDue: string;
  itemName: string;
  customerEmail: string;
  dueDate: string;
  invoiceId?: string;
}

export async function createOrUpdateInvoice(
  params: CreateOrUpdateInvoiceParams,
) {
  await connectToDB();

  const session = await getSession();

  if (!session || !session.userId || !session.email) {
    throw new Error("Unauthorized access");
  }

  try {

    const { customerEmail, dueDate, invoiceId, ...updateParams } = params;

    // Convert dueDate back to Date type
    const parsedDueDate = new Date(dueDate);

    // Query the User document to get the payerUser ID
    const payerUser = await User.findOne({ email: customerEmail });

    if (!payerUser) {
      return { error: "Customer is not on Mileston" };
    }

    // Calculate the status based on the due date
    const currentStatus =
      parsedDueDate < new Date() ? "overdue" : "pending";

    if (invoiceId) {
      // Update existing invoice
      const existingInvoice: any = await InvoiceModel.findById(invoiceId);

      if (!existingInvoice) {
        return { error: "Invoice not found" };
      }

      if (existingInvoice.receiverUser.toString() !== session.userId) {
        return { error: "Unauthorized to update this invoice" };
      }

      Object.assign(existingInvoice, updateParams, {
        dueDate: parsedDueDate,
        status: currentStatus,
        payerUser: payerUser._id,
      });
      await existingInvoice.save();

      const invoiceUrl = `https://mileston.co/invoice/${existingInvoice._id.toString()}`;

      // Send an email about the updated invoice
      sendInvoiceNotification(
        customerEmail,
        session.email,
        invoiceUrl,
        "Updated",
      );

      return { message: "Invoice updated successfully!" };
    } else {
      // Create new invoice
      const newInvoice: any = new InvoiceModel({
        ...updateParams,
        customerEmail: customerEmail,
        dueDate: parsedDueDate,
        status: currentStatus,
        payerUser: payerUser._id,
        receiverUser: session.userId,
        createdAt: new Date(),
      });

      await newInvoice.save();

      // Send an email about the new invoice
      const invoiceUrl = `https://mileston.co/invoice/${newInvoice._id.toString()}`;

      // Send an email about the updated invoice
      sendInvoiceNotification(customerEmail, session.email, invoiceUrl, "New");

      return { message: "Invoice created successfully!" };
    }
  } catch (error: any) {
    console.error("Error creating or updating invoice:", error.message);
    throw new Error("Failed to create or update invoice");
  }
}


export interface InvoiceDetails {
  amountDue: string;
  itemName: string;
  dueDate: string;
  customerEmail: string;
}

export interface PaymentDetails {
  amountDue: string;
  customerEmail: string;
  status: string;
  receiverUser: string;
  identifier: string;
}

export async function getInvoiceDetailsById(
  invoiceId: string,
  forPayment?: boolean
): Promise<InvoiceDetails | PaymentDetails | { error: string }> {
  await connectToDB();

  try {
    // Determine which fields to select based on the forPayment parameter
    const selectFields = forPayment
      ? "amountDue customerEmail status receiverUser"
      : "amountDue itemName dueDate customerEmail status";

    // Fetch invoice details
    const invoiceDetails: any = await InvoiceModel.findById(invoiceId)
      .select(selectFields)
      .lean(); // Convert to a plain JavaScript object

    if (!invoiceDetails) {
      return { error: "Invoice not found" };
    }

    if (invoiceDetails.status === "paid") {
      return { error: "Invoice has been expired" };
    }

    // Convert and format the dueDate for input[type="date"]
    const formattedDueDate = invoiceDetails.dueDate
      ? new Date(invoiceDetails.dueDate).toISOString().split('T')[0]
      : "";

    // Return the data in the format expected based on forPayment
    if (forPayment) {
      console.log("receiver:", invoiceDetails.receiverUser)
      const user: any = await User.findById(invoiceDetails.receiverUser);
      console.log("User Doc:", user)
      const wallet: any = await Wallet.findOne({ user: invoiceDetails.receiverUser });
      console.log("Wallet Doc:", wallet)
      return {
        amountDue: invoiceDetails.amountDue || "",
        customerEmail: invoiceDetails.customerEmail || "",
        status: invoiceDetails.status || "",
        receiverUser: user.email || "",
        identifier: wallet.solanaPublicKey || "",
      };
    } else {
      return {
        amountDue: invoiceDetails.amountDue || "",
        itemName: invoiceDetails.itemName || "",
        dueDate: formattedDueDate || "",
        customerEmail: invoiceDetails.customerEmail || "",
      };
    }
  } catch (error: any) {
    console.error("Error getting invoice details from DB:", error.message);
    throw new Error("Failed to get invoice details");
  }
}

interface PayInvoice extends SendFundsToWalletParams {
  invoiceId: string;
}

export async function payInvoice(params: PayInvoice) {
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
      const updateInvoice = await InvoiceModel.findByIdAndUpdate(
        params.invoiceId,
        { payerUser: session.userId, status: "paid" },
        { new: true }, // Return the updated document
      );

      if (updateInvoice) {
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

interface InvoiceDocument {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
}

interface PaymentLinkDocument {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
}

export async function fetchPaymentLinkAndInvoice(): Promise<InvoiceBarProps[] | null> {
  await connectToDB();

  const session = await getSession();

  if (!session || !session.userId) {
    throw new Error("User not authorized");
  }

  try {
    const invoiceDocs = await InvoiceModel.find({
      receiverUser: session.userId,
    })
      .select("_id createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean() as InvoiceDocument[];

    const paymentDocs = await PaymentLinkModel.find({
      receiverUser: session.userId,
    })
      .select("_id createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean() as PaymentLinkDocument[];

    if (invoiceDocs.length > 0 || paymentDocs.length > 0) {
      const invoiceData = invoiceDocs.map((inv) => ({
        type: "invoice" as const,
        text: `Invoice created on ${new Date(inv.createdAt).toLocaleDateString()}: ID: ${inv._id.toString()}`,
        url: `https://mileston.co/invoice/${inv._id.toString()}`,
        invoiceId: inv._id.toString(),
      }));

      const paymentData = paymentDocs.map((pay) => ({
        type: "paymentLink" as const,
        text: `Payment Link created on ${new Date(pay.createdAt).toLocaleDateString()}: ID: ${pay._id.toString()}`,
        url: `https://mileston.co/payment/${pay._id.toString()}`,
        invoiceId: pay._id.toString(),
      }));

      return [...invoiceData, ...paymentData];
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error retrieving invoice and payment details from DB:", error);
    return null;
  }
}