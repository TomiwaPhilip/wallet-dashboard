"use server";

import connectToDB from "@/server/model/database";
import getSession from "../server-hooks/getsession.action";
import Wallet from "@/server/schemas/wallet";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { formatBigIntToFixed } from "@/components/shared/formatBigInt";

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export async function fetchWalletBalance() {
  try {
    // Ensure the database connection is established
    await connectToDB();

    // Get the current user session
    const session = await getSession();

    // Extract the userId from the session
    const userId = session?.userId;
    let owner;
    if (!session || !session.solanaAddress) {
      throw new Error("User is not authenticated");
    } else { owner = session.solanaAddress }

    const tokenAccounts = await connection.getTokenAccountsByOwner(
      new PublicKey(owner),
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");

    let balance: bigint | undefined;
    tokenAccounts.value.forEach((tokenAccount) => {
      const accountData = AccountLayout.decode(tokenAccount.account.data);
      balance = accountData.amount as bigint;

      console.log(`${new PublicKey(accountData.mint)}   ${accountData.amount}`);
    });

    if (!balance) {
      throw new Error("Unable to fetch balance from the blockchain");
    }

    // console.log(tokenAccounts);

    console.log(`Fetching balance for userId: ${userId}`);

    // Query the wallet balance using the userId
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new Error("Wallet not found for the current user");
    }

    // Log the wallet balance
    console.log(`User balance in DB: ${wallet.balance}`);

    // Check if there is a change in balance
    if (wallet.balance !== balance) {
      // Comment to send an email to the user about the change in balance
      console.log("Balance has changed. Sending email to the user about the added amount...");

      // Update the balance in the database
      wallet.balance = balance;
      await wallet.save();
    }

    const newBalance = formatBigIntToFixed(balance, 2)

    // Save the balance in the session
    session.walletBalance = newBalance;
    await session.save();

    return newBalance;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw new Error("Unable to fetch current user balance from DB");
  }
}
