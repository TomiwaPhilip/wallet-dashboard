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


export async function getInvoiceDetailsById(invoiceId: string) {
  await connectToDB();

  try {
    // Select only necessary fields and exclude _id, receiverUser, payerUser, and timestamps
    const invoiceDetails = await InvoiceModel.findById(invoiceId)
      .select("-_id -receiverUser -createdAt -updatedAt")
      .lean(); // Convert to a plain JavaScript object

    if (!invoiceDetails) {
      throw new Error("Invoice not found");
    }

    if (invoiceDetails.status === "expired") {
      return { error: "Invoice Details has expired" };
    } else {
      return invoiceDetails;
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

export async function fetchPaymentLinkAndInvoice() {
  await connectToDB();

  const session = await getSession();

  if (!session || !session.userId) {
    throw new Error("User not authorized");
  }

  try {
    const invoice = await InvoiceModel.find({
      receiverUser: session.userId,
    })
      .select("_id createdAt")
      .sort({ timestamp: -1 })
      .limit(3)
      .lean();

    const payment = await PaymentLinkModel.find({
      receiverUser: session.userId,
    })
      .select("_id createdAt")
      .sort({ timestamp: -1 })
      .limit(3)
      .lean();

    if (invoice.length > 0 || payment.length > 0) {
      return {
        invoice: invoice,
        payment: payment,
      };
    } else {
      return { error: "No invoice or payment details found" };
    }
  } catch (error: any) {
    console.error(
      "Error retrieving invoice and payment details from DB:",
      error,
    );
    return { error: "Unable to retrieve invoice and payment details" };
  }
}
