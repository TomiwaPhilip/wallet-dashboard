import getSession from "./actions/server-hooks/getsession.action";
import { SessionData } from "./iron-session/session";
import crypto from "crypto";
import { Resend } from "resend";

interface SendVerificationRequestParams {
  code: string;
  email: string;
}

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams,
) => {
  try {
    const resendKey = process.env.RESEND_KEY;
    if (!resendKey) {
      throw new Error("RESEND_KEY is not defined in environment variables");
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "onboarding@mileston.co",
      to: params.email,
      subject: "Login Link to your Account",
      html: `<p>Copy the below code to sign in to your account:</p>
             <p>${params.code}</p>`,
    });
  } catch (error: any) {
    console.error("Error sending verification request:", error.message);
  }
};

export const sendBalanceChangedNotification = async (
  amount: string,
  email: string,
  state: string,
) => {
  try {
    console.log("sending email to user!");
    const resend = new Resend(process.env.RESEND_KEY!);
    await resend.emails.send({
      from: "no-reply@mileston.co",
      to: email,
      subject: "Wallet Ballance Changed!",
      html: `<p>Hello. You have ${state} ${amount} USDC in your account</p>`,
    });
  } catch (error) {
    console.log({ error });
  }
};

export const sendInvoiceNotification = async (
  email: string,
  receiverEmail: string,
  url: string,
  status: string,
) => {
  try {
    console.log("Sending email to user!");

    const resend = new Resend(process.env.RESEND_KEY!);

    await resend.emails.send({
      from: "no-reply@mileston.co",
      to: email,
      subject: `${status} Invoice Received!`,
      html: `<p>Hello,</p>
             <p>You have received a ${status} invoice from <strong>${receiverEmail}</strong>.</p>
             <p>Click <a href="${url}"><strong>here</strong></a> to view the invoice.</p>`,
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending invoice notification:", error);
  }
};

export async function saveSession(session: SessionData): Promise<void> {
  // Check if session exists
  let existingSession = await getSession();

  // Assign session properties
  existingSession.userId = session.userId;
  existingSession.email = session.email;
  existingSession.firstName = session.firstName;
  existingSession.lastName = session.lastName;
  existingSession.image = session.image;
  existingSession.walletBalance = session.walletBalance;
  existingSession.walletAddress = session.walletAddress;
  existingSession.solanaAddress = session.solanaAddress;
  existingSession.isOnboarded = session.isOnboarded;
  existingSession.isVerified = session.isVerified;
  existingSession.isLoggedIn = session.isLoggedIn;

  // Save the session
  await existingSession.save();
}

export function generateVerificationCode(): {
  code: string;
  generatedAt: Date;
  expiresIn: Date;
} {
  // Generate 5 random numbers
  const code = Array.from({ length: 5 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");

  // Current time
  const generatedAt = new Date();

  // 5 minutes expiration
  const expiresIn = new Date(generatedAt.getTime() + 5 * 60 * 1000);

  return { code, generatedAt, expiresIn };
}
