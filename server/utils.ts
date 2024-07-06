import getSession from "./actions/server-hooks/getsession.action";
import { SessionData } from "./iron-session/session";
import crypto from "crypto";
import { Resend } from "resend";

interface SendVerificationRequestParams {
  url: string;
  email: string;
}
export const sendVerificationRequest = async (
  params: SendVerificationRequestParams,
) => {
  try {
    const resend = new Resend(process.env.RESEND_KEY!);
    await resend.emails.send({
      from: "onboarding@mileston.co",
      to: params.email,
      subject: "Login Link to your Account",
      html:
        '<p>Click the magic link below to sign in to your account:</p>\
               <p><a href="' +
        params.url +
        '"><b>Sign in</b></a></p>',
    });
  } catch (error) {
    console.log({ error });
  }
};

export const sendBalanceChangedNotification = async (amount: string, email: string, state: string) => {
  try {
    console.log("sending email to user!")
    const resend = new Resend(process.env.RESEND_KEY!);
    await resend.emails.send({
      from: "no-reply@mileston.co",
      to: email,
      subject: "Wallet Ballance Changed!",
      html:
        `<p>Hello. You have ${state} ${amount} USDC in your account</p>`
    });
  } catch (error) {
    console.log({ error });
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

// Function to hash a token
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateToken(): {
  token: string;
  generatedAt: Date;
  expiresIn: Date;
} {
  // Generate a random token
  const token = crypto.randomBytes(20).toString("hex");

  // Current time
  const generatedAt = new Date();

  // 5 minutes expiration
  const expiresIn = new Date(generatedAt.getTime() + 5 * 60 * 1000);

  // Encrypt the token using SHA-256 hash function
  const hashedToken = hashToken(token);

  return { token: hashedToken, generatedAt, expiresIn };
}

// Function to verify a token
export function verifyToken(
  providedToken: string,
  storedToken: string,
): boolean {
  // Hash the provided token
  const hashedProvidedToken = hashToken(providedToken);

  // Compare the hashed provided token with the stored token
  return hashedProvidedToken === storedToken;
}
