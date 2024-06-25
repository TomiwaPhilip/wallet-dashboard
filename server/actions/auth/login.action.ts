"use server";

import VerificationToken from "../../schemas/emailTokenSchema";
import {
  generateToken,
  sendVerificationRequest,
  verifyToken,
  saveSession,
} from "../../utils";
import connectToDB from "../../model/database";
import User from "../../schemas/user";
import getSession from "../server-hooks/getsession.action";
import { getGoogleAuthUrl } from "@/server/actions/server-hooks/google-auth.action";
import { redirect } from "next/navigation";
import Memo from "../../schemas/memo";
import { generateMemoTag } from "../../helpers/utils";
import Wallet from "../../schemas/wallet";
import { createWallet } from "../wallet/wallet.action";

export async function signIn(email: string) {
  console.log("I want to send emails");
  try {
    connectToDB();

    // Generate token and URL for verification
    const { token, generatedAt, expiresIn } = generateToken();

    const url = `https://public-mileston.vercel.app/auth/verify?token=${token}`;

    // Send email with resend.dev
    await sendVerificationRequest({ url: url, email: email });

    console.log("Email sent!");

    // Save email address, verification token, and expiration time in the database
    const save = await VerificationToken.create({
      token: token,
      email: email,
      createdAt: generatedAt, // Since generated in the function, set current time
      expiresAt: expiresIn,
    });

    if (save) {
      console.log("saved token to DB");
    }

    // Return a response
    return true;
  } catch (error) {
    return false;
  }
}

export async function verifyUserTokenAndLogin(token: string) {
  try {
    connectToDB();

    const existingToken = await VerificationToken.findOne({ token: token });

    if (!existingToken) {
      console.log("Token not found in DB");
      return { error: "Invalid Credentials!" }; // Token not found in the database
    }

    // Check if the token has expired
    const currentTime = new Date();
    const createdAt = existingToken.createdAt;
    const expiresIn = existingToken.expiresAt;
    const timeDifference = currentTime.getTime() - createdAt.getTime(); // Time difference in milliseconds
    const minutesDifference = Math.floor(timeDifference / (1000 * 60)); // Convert milliseconds to minutes
    if (minutesDifference > 5) {
      console.log("Token has expired");
      // If the token has expired, delete the token document from the database
      await VerificationToken.findOneAndDelete({ token: token });
      return { error: "Invalid token" };; // Token has expired
    }

    const email = existingToken.email;

    try {
      // Check if the user already exists in the Role collection with the correct login type
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {

        // const existingMemo = await Memo.findOne({ user: existingUser._id });

        const existingWallet = await Wallet.findOne({ user: existingUser._id });

        // Create session data
        let sessionData = {
          userId: existingUser._id.toString(),
          email: existingUser.email,
          firstName: existingUser.firstname,
          lastName: existingUser.lastname,
          image: existingUser.image, // Initialize image as an empty string
          walletBalance: existingWallet.balance,
          walletAddress: existingWallet.usdcAddress,
          isOnboarded: existingUser.onboarded,
          isVerified: existingUser.verified,
          isLoggedIn: true,
        };

        // Save session
        await saveSession(sessionData);

        // If the token is valid, delete the token document from the database
        await VerificationToken.findOneAndDelete({ token: token });

        // Redirect to the dashboard or appropriate page
        return { newUser: false };
      } else {
        // User does not exist, create a new organization and role with the received email
        console.log("I got to create new user")
        // Create a new User for the user with the received email
        const newUser = await User.create({
          email: email,
          loginType: "email", // or the appropriate login type
        });

        // const memo = generateMemoTag();

        // const newMemo = await Memo.create({
        //   memo: memo,
        //   user: newUser._id,
        // });
        console.log("I got to createing new wallet")
        const newWallet = await createWallet(newUser._id)

        if(newWallet.error) {
          return {error: "error creating wallet for user"}
        }

        // Create session data
        const sessionData = {
          userId: newUser._id.toString(),
          email: newUser.email,
          walletBalance: newWallet.balance,
          walletAddress: newWallet.publicKey,
          isOnboarded: newUser.onboarded,
          isVerified: newUser.verified,
          isLoggedIn: true,
        };

        // Save session
        await saveSession(sessionData);

        // If the token is valid, delete the token document from the database
        await VerificationToken.findOneAndDelete({ token: token });

        // Redirect to the dashboard or appropriate page
        return { newUser: true };
      }
    } catch (error: any) {
      console.error("Error logging user in", error.message);
      return { error: "Error logging in. Try again later!" };
    }
  } catch (error: any) {
    console.error("Error verifying token:", error.message);
    return { error: "Error verifying token. Try again later!" };
  }
}

export async function getMnemonic() {
  await connectToDB();

  const session = await getSession();
  const userId = session.userId;

  try {
      // Fetch only the deletedKeyPart field for the user
      const wallet = await Wallet.findOne({ user: userId }, { deletedKeyPart: 1 });

      console.log(userId)

      console.log(wallet)

      if (!wallet) {
          return {error: "Wallet not found"};
      }

      // Extract the secret key (deletedKeyPart)
      const secretKey = wallet.deletedKeyPart;

      // Clear the secret key from the database
      await Wallet.updateOne({ user: userId }, { $unset: { deletedKeyPart: '' } });

      return { secretKey: secretKey };
  } catch (error) {
      console.error('Error in getMnemonic:', error);
      return { error: 'Error retrieving or clearing mnemonic. Please try again.' };
  }
}

export const signOut = async () => {
  console.log("Okay, you caught me!")
  const session = await getSession();
  session.destroy();
  redirect("/auth/signin");
};

let googleAuthUrl: string;
export async function handleGoogleLogin() {
  try {
    // Get the Google OAuth URL
    googleAuthUrl = await getGoogleAuthUrl();
  } catch (error) {
    console.error("Error:", error);
    // Handle error
  } finally {
    // Redirect the user to the Google OAuth URL
    redirect(googleAuthUrl);
  }
}
