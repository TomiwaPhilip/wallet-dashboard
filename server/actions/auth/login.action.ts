"use server";

import VerificationToken from "../../schemas/emailTokenSchema";
import {
  sendVerificationRequest,
  saveSession,
  generateVerificationCode,
} from "../../utils";
import connectToDB from "../../model/database";
import User from "../../schemas/user";
import getSession from "../server-hooks/getsession.action";
import { getGoogleAuthUrl } from "@/server/actions/server-hooks/google-auth.action";
import { permanentRedirect, redirect } from "next/navigation";
import Wallet from "../../schemas/wallet";
import { createWallet } from "../wallet/wallet.action";
import { NextResponse } from "next/server";

export async function signIn(email: string) {
  console.log("I want to send emails");
  try {
    await connectToDB();

    // Generate code and timestamps for verification
    const { code, generatedAt, expiresIn } = generateVerificationCode();

    console.log(code);

    // Send email with resend.dev
    await sendVerificationRequest({ code, email });

    console.log("Email sent!");

    // Save email address, verification code, and expiration time in the database
    const save = await VerificationToken.create({
      token: code, // Use the generated code
      email,
      createdAt: generatedAt, // Since generated in the function, set current time
      expiresAt: expiresIn,
    });

    if (save) {
      console.log("saved code to DB");
    }

    // Return a response
    return true;
  } catch (error) {
    console.error("Error during sign-in:", error);
    return false;
  }
}

export async function verifyUserTokenAndLogin(code: string) {
  try {
    await connectToDB();

    const existingToken = await VerificationToken.findOne({ token: code });

    if (!existingToken) {
      console.log("Code not found in DB");
      return { error: "Invalid Credentials!" }; // Code not found in the database
    }

    const currentTime = new Date();
    if (currentTime > existingToken.expiresAt) {
      console.log("Code has expired");
      await VerificationToken.findOneAndDelete({ token: code });
      return { error: "Invalid code" }; // Code has expired
    }

    const email = existingToken.email;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        const existingWallet = await Wallet.findOne({ user: existingUser._id });

        const sessionData = {
          userId: existingUser._id.toString(),
          email: existingUser.email,
          firstName: existingUser?.firstname || "",
          lastName: existingUser?.lastname || "",
          image: existingUser?.image || "",
          walletBalance: existingWallet.balance,
          walletAddress: existingWallet.usdcAddress,
          solanaAddress: existingWallet.solanaPublicKey,
          isOnboarded: existingUser.onboarded,
          isVerified: existingUser.verified,
          isSecretCopied: existingUser.isSecretCopied,
          isLoggedIn: true,
        };

        await saveSession(sessionData);

        await VerificationToken.findOneAndDelete({ token: code });

        const session = await getSession();

        if (session.callbackUrl != null) {
          const callbackUrl = session.callbackUrl;

          return { newUser: false, callbackUrl: callbackUrl };
        }

        return { newUser: false };
      } else {
        console.log("Creating new user");

        const newUser = await User.create({
          email,
          loginType: "email",
        });

        console.log("Creating new wallet");
        const newWallet = await createWallet(newUser._id);

        if (newWallet.error) {
          return { error: "Error creating wallet for user" };
        }

        const sessionData = {
          userId: newUser._id.toString(),
          email: newUser.email,
          walletBalance: newWallet.balance,
          walletAddress: newWallet.publicKey,
          solanaAddress: newWallet.solanaAddress,
          isOnboarded: newUser.onboarded,
          isVerified: newUser.verified,
          isSecretCopied: newUser.isSecretCopied,
          isLoggedIn: true,
        };

        await saveSession(sessionData);

        await VerificationToken.findOneAndDelete({ token: code });

        return { newUser: true };
      }
    } catch (error: any) {
      console.error("Error logging user in", error.message);
      return { error: "Error logging in. Try again later!" };
    }
  } catch (error: any) {
    console.error("Error verifying code:", error.message);
    return { error: "Error verifying code. Try again later!" };
  }
}

export async function getMnemonic() {
  await connectToDB();

  const session = await getSession();
  const userId = session.userId;

  try {
    // Fetch only the deletedKeyPart field for the user
    const wallet = await Wallet.findOne(
      { user: userId },
      { deletedKeyPart: 1 }
    );

    console.log(userId);

    console.log(wallet);

    if (!wallet) {
      return { error: "Wallet not found" };
    }

    // Extract the secret key (deletedKeyPart)
    const secretKey = wallet.deletedKeyPart;

    // // Clear the secret key from the database
    // await Wallet.updateOne(
    //   { user: userId },
    //   { $unset: { deletedKeyPart: "" } }
    // );

    return { secretKey: secretKey };
  } catch (error) {
    console.error("Error in getMnemonic:", error);
    return {
      error: "Error retrieving or clearing mnemonic. Please try again.",
    };
  }
}

export async function deleteMnemonic() {
  try {
    await connectToDB();

    const session = await getSession();
    const userId = session.userId;

    // Clear the secret key from the database
    await Wallet.updateOne(
      { user: userId },
      { $unset: { deletedKeyPart: "" } }
    );

    // Update the user document to mark the secret as copied
    const user = await User.findByIdAndUpdate(userId, {
      isSecretCopied: true,
    }, { new: true });  // Return the updated document
    console.log("Updated User:", user);  // Log the updated user document
    

    // Update the session to reflect the change
    session.isSecretCopied = true;
    await session.save();

    return { message: true };
  } catch (error: any) {
    console.error("Error in deleteMnemonic:", error);
    return { message: false, error: error.message };
  }
}

export const signOut = async () => {
  console.log("Okay, you caught me!");
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
