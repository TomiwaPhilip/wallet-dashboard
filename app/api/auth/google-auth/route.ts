import { NextRequest, NextResponse } from "next/server";

import {
  getGoogleAccessToken,
  getGoogleUserInfo,
} from "@/server/actions/server-hooks/google-auth.action";
import connectToDB from "@/server/model/database";
import User from "@/server/schemas/user";
import { saveSession } from "@/server/utils";
import { generateMemoTag } from "@/server/helpers/utils";
import Memo from "@/server/schemas/memo";
import Wallet from "@/server/schemas/wallet";
import { createWallet } from "@/server/actions/wallet/wallet.action";

export async function GET(req: NextRequest, res: NextResponse) {
  if (!req.nextUrl) {
    return new Response("No request query found!", { status: 401 });
  }

  const code = req.nextUrl.searchParams.get("code");

  // Check if code is undefined
  if (!code) {
    return new Response("No code is provided", { status: 401 });
  }

  try {
    // Exchange the authorization code for an access token
    const accessToken = await getGoogleAccessToken(code);

    if (!accessToken) {
      return new Response("No access token provided", { status: 401 });
    }
    // Use the access token to retrieve user information from Google
    const userInfo = await getGoogleUserInfo(accessToken);

    try {
      // Connect to the database
      connectToDB();

      // Destructure the relevant properties from userInfo with optional chaining and nullish coalescing
      const { email, given_name, family_name, picture } = userInfo ?? {};

      // Check if the user already exists in the User collection with the correct login type
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        const existingMemo = await Memo.findOne({ user: existingUser._id });
        const existingWallet = await Wallet.findOne({ user: existingUser._id });
        
        // Create session data
        let sessionData = {
          userId: existingUser._id.toString(),
          email: existingUser.email,
          firstName: existingUser.firstname,
          lastName: existingUser.lastname,
          image: existingUser.image, // Initialize image as an empty string
          memo: existingMemo.memo,
          walletBalance: existingWallet.balance,
          walletAddress: existingWallet.usdcAddress,
          solanaAddress: existingWallet.solanaPublicKey,
          isOnboarded: existingUser.onboarded,
          isVerified: existingUser.verified,
          isSecretCopied: existingUser.isSecretCopied,
          hasJoinedWaitlist: existingUser.hasJoinedWaitlist,
          isLoggedIn: true,
        };

        if (existingUser.loginType === "google") {
          // User exists with the correct login type (Google), proceed with login
          console.log(
            "User found with correct login type (Google), proceeding with login",
          );

          // Save session
          await saveSession(sessionData);

          // Redirect to the dashboard or appropriate page
          return NextResponse.redirect(new URL("/", req.url));
        } else if (existingUser.loginType === "email") {
          // User exists with the correct login type (email), proceed with login
          console.log(
            "User found with correct login type (email), proceeding with login",
          );

          // Save session
          await saveSession(sessionData);

          // Redirect to the dashboard or appropriate page
          return NextResponse.redirect(new URL("/", req.url));
        } else {
          // User exists with a different login type, redirect to error page
          console.log(
            "User found with incorrect login type, redirecting to error page",
          );

          // Redirect to error page with appropriate error message
          return NextResponse.redirect(new URL("/auth/error", req.url));
        }
      } else {
        // User does not exist, create a new organization and User with the received email
        console.log("User not found continuing with creating new user");

        // Create a new User for the user with the received email
        const newUser = await User.create({
          email: email,
          image: picture,
          firstname: given_name,
          lastname: family_name,
          loginType: "google", // or the appropriate login type
        });

        // const memo = generateMemoTag();

        // const newMemo = await Memo.create({
        //   memo: memo,
        //   user: newUser._id,
        // });

        const newWallet = await createWallet(newUser._id);

        // Create session data
        const sessionData = {
          userId: newUser._id.toString(),
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          image: newUser.image,
          walletBalance: newWallet.balance,
          walletAddress: newWallet.publicKey,
          solanaAddress: newWallet.solanaAddress,
          isOnboarded: newUser.onboarded,
          isVerified: newUser.verified,
          isSecretCopied: newUser.isSecretCopied,
          hasJoinedWaitlist: newUser.hasJoinedWaitlist,
          isLoggedIn: true,
        };

        // Save session
        await saveSession(sessionData);

        // Redirect to the dashboard or appropriate page
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error:", error);
      return Response.json({ error: "Internal Server Error", status: 500 });
    }
  } catch (error) {
    // Handle any errors that occur during the authentication process
    console.error("Error:", error);
    return Response.json({ error: "Internal Server Error", status: 500 });
  }
}
