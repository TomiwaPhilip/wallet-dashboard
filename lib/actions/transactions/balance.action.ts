"use server";

import connectToDB from "@/lib/model/database";
import getSession from "../server-hooks/getsession.action";
import Wallet from "@/lib/schemas/wallet";

export async function fetchWalletBalance() {
  try {
    // Ensure the database connection is established
    await connectToDB();

    // Get the current user session
    const session = await getSession();

    // Extract the userId from the session
    const userId = session?.userId;
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    console.log(`Fetching balance for userId: ${userId}`);

    // Query the wallet balance using the userId
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new Error("Wallet not found for the current user");
    }

    // Log the wallet balance
    console.log(`User balance: ${wallet.balance}`);

    // Save the balance in the session and return it
    session.walletBalance = wallet.balance;
    await session.save();

    return wallet.balance;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw new Error("Unable to fetch current user balance from DB");
  }
}
