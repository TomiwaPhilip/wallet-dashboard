"use server";

import connectToDB from "@/server/model/database";
import getSession from "../server-hooks/getsession.action";
import Wallet from "@/server/schemas/wallet";
import User from "@/server/schemas/user";
import TransactionSignature from "@/server/schemas/transactionSignature";
import Transaction, { TransactionType } from "@/server/schemas/transaction"; // Adjust import as per your schema file\
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  transfer,
} from '@solana/spl-token';

import { fetchBalanceFromChain, hexToBytes } from "./utils";
import { mnemonicToKeypairForRetrieval, getPlatformWallet } from "../server-hooks/platformWallet.action";
import { sendBalanceChangedNotification } from "@/server/utils";

function isFloat(n: any) {
  return Number(n) === n && n % 1 !== 0;
}

function isInteger(n: any) {
  return Number.isInteger(n);
}

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export interface SendFundsToWalletParams {
  identifier: string;
  amount: string;
  secretPhrase: string;
}

export async function sendFundsToWallet(params: SendFundsToWalletParams) {
  try {
    const { identifier, amount, secretPhrase } = params;
    console.log(params)

    // Ensure the database connection is established
    await connectToDB();

    // Get the current user session (sender)
    const senderSession = await getSession();
    if (!senderSession || !senderSession.userId || !senderSession.solanaAddress) {
      return { error: "Sender is not authenticated" };
    }

    // Validate identifier
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const walletRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

    let recipientWalletAddress: string;
    if (emailRegex.test(identifier)) {
      if (!senderSession.isOnboarded) return { error: "Unable to send funds with email. Complete onboarding in settings." };
      const user = await User.findOne({ email: identifier });
      if (!user) throw new Error("User not found");
      const recipientWallet = await Wallet.findOne({ user: user._id });
      if (!recipientWallet) throw new Error("Recipient's wallet not found");
      recipientWalletAddress = recipientWallet.solanaPublicKey;
    } else if (phoneRegex.test(identifier)) {
      if (!senderSession.isOnboarded) return { error: "Unable to send funds with phone number. Complete onboarding in settings." }
      const user = await User.findOne({ phoneNumber: identifier });
      if (!user) throw new Error("User not found");
      const recipientWallet = await Wallet.findOne({ user: user._id });
      if (!recipientWallet) throw new Error("Recipient's wallet not found");
      recipientWalletAddress = recipientWallet.solanaPublicKey;
    } else if (walletRegex.test(identifier)) {
      recipientWalletAddress = identifier;
    } else {
      throw new Error("Invalid identifier format");
    }

    // Fetch sender's wallet
    const senderWallet = await Wallet.findOne({ user: senderSession.userId });
    if (!senderWallet) {
      return { error: "Sender's wallet not found" };
    }

    // Recover sender's full secret key
    const sender = await mnemonicToKeypairForRetrieval(secretPhrase, senderWallet.secretKey)

    // Fetch USDC balance from blockchain
    const usdcMintAddress = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // USDC Mint Address (Dev Net)
    const balance = await fetchBalanceFromChain(senderSession?.solanaAddress);

    if (!balance) {
      return { error: "Unable to fetch balance" };
    }
    let amountToSend;
    const checkAmount = Number(amount)
    if(isFloat(checkAmount)) {
      console.log("Number is float")
      amountToSend = BigInt(checkAmount * 10 ** 6)
    } else if (isInteger(checkAmount)) {
      console.log("Number is integer")
      amountToSend = BigInt(amount) * BigInt(10 ** 6);
    } else {
      return {error: "Invalid amount input!"}
    }

    console.log(amountToSend, "amount to send in bigint");
    console.log(Number(amountToSend), "amount to send in number")
    const transactionFee = BigInt(0.1 * 10 ** 6);
    if (balance < amountToSend + transactionFee) {
      return { error: "Insufficient balance to send funds" };
    }

    const receiverPublicKey = new PublicKey(recipientWalletAddress);
    const senderPublicKey = new PublicKey(senderSession.solanaAddress)

    // Transfer funds on-chain
    const sourceTokenAccount = await getAssociatedTokenAddress(usdcMintAddress, senderPublicKey);
    if(!sourceTokenAccount) throw new Error("Unable to get source token account")
      console.log(sourceTokenAccount, "I am the source")
    const receiverTokenAccount = await getAssociatedTokenAddress(usdcMintAddress, receiverPublicKey)
    if(!receiverTokenAccount) throw new Error("Unable to get receiver token account")
      console.log(receiverTokenAccount, "I am the receiver")

    const signature = await transfer(
      connection,
      sender,
      sourceTokenAccount,
      receiverTokenAccount,
      sender.publicKey,
      Number(amountToSend)
    );

    console.log(`Transaction signature: ${signature}`);

    if (signature) {
      const saveSignature = await TransactionSignature.create({
        user: senderSession.userId,
        transactionType: "sent",
        signature: signature,
        timeStamp: new Date(),
      });

      await saveSignature.save();
    }

    const owner = new PublicKey("kMkrSLY4sNv8jjHydUa5P5pHfZ1PSgYvB6W6K9e95do")
    const ownerTokenAccount = await getAssociatedTokenAddress(usdcMintAddress, owner);

    await transfer(
      connection,
      sender,
      sourceTokenAccount,
      ownerTokenAccount,
      senderPublicKey,
      Number(transactionFee)
    );

    // Update sender's wallet balance (subtract amount and fee)
    senderWallet.balance = (BigInt(senderWallet.balance) - (amountToSend + transactionFee)).toString();
    await senderWallet.save();

    // Update sender's session balance
    senderSession.walletBalance = senderWallet.balance;
    await senderSession.save();

    // Log transaction details
    console.log(`Funds transferred from ${senderSession.email} to ${identifier}: ${amount}`);

    // Create transaction document
    const newTransaction = new Transaction({
      type: TransactionType.SENT,
      sender: senderSession.userId,
      receiver: identifier,
      amount: Number(amount),
      currency: 'USDC', // Assuming default currency
      timestamp: new Date()
    });

    // Save transaction to database
    await newTransaction.save();

    // Send success email
    const data = await sendBalanceChangedNotification(amount, senderSession.email as string, "been debited");
    // Return success message
    return { message: "Transaction completed successfully!" };
  } catch (error) {
    console.error("Error transferring funds:", error);
    return { error: "Unable to transfer. Please try again later." };
  }
}


interface SendFundsToExternalWalletParams {
  walletAddress: string;
  usdcNetwork: string;
  amount: string;
}

export async function sendFundsToExternalWallet(params: SendFundsToExternalWalletParams) {
  console.log(params)
  try {
    console.log(params)
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const usdcMintAddress = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // USDC Mint Address (Dev Net)

    const ownerStuff = await getPlatformWallet();

    const ownerSecretBytes = hexToBytes(ownerStuff.secretKey);
    const owner = Keypair.fromSecretKey(ownerSecretBytes);

    // Ensure the database connection is established
    await connectToDB();

    // Get the current user session (sender)
    const senderSession = await getSession();
    if (!senderSession || !senderSession.userId) {
      return { error: "Sender is not authenticated" };
    }

    console.log(senderSession)

    // Fetch sender's wallet
    const senderWallet = await Wallet.findOne({ user: senderSession.userId });
    if (!senderWallet) {
      return { error: "Sender's wallet not found" };
    }

    // Validate sender has enough balance
    const amountToSend = parseFloat(params.amount);
    if (senderWallet.balance < amountToSend) {
      return { error: "Insufficient balance to send funds" };
    }

    // Fetch receiver's wallet
    const receiverWallet = params.walletAddress;

    const receiverPublicKey = new PublicKey(receiverWallet)

    console.log(receiverPublicKey)

    try {
      // Send the amount Onchain 
      const sourceTokenAccount = await getAssociatedTokenAddress(
        usdcMintAddress,
        owner.publicKey,
      );

      console.log(sourceTokenAccount)
      const receiverTokenAccount = await getAssociatedTokenAddress(
        usdcMintAddress,
        receiverPublicKey,
      );

      console.log("Did you touch here?")
      console.log(receiverTokenAccount)

      const signature = await transfer(
        connection,
        owner,
        sourceTokenAccount,
        receiverTokenAccount,
        owner.publicKey,
        amountToSend * 10 ** 6,
      );
      // Log the transaction signature
      console.log(`Transaction signature: ${signature}`);

      if (signature) {
        const saveSignature = TransactionSignature.create({
          user: senderSession.userId,
          transactionType: "sent",
          signature: signature,
          timeStamp: new Date(),
        });

        console.log(saveSignature);
      }
    } catch (error) {
      return { error: "Error initiating transaction!" }
    }

    // Update sender's wallet balance (subtract amount)
    senderWallet.balance -= amountToSend;
    await senderWallet.save();

    // Log transaction details
    console.log(`Funds transferred from ${senderSession.email} to ${params.walletAddress}: ${amountToSend}`);

    // Create transaction document
    const newTransaction = new Transaction({
      type: TransactionType.SENT,
      sender: senderSession.userId,
      receiver: params.walletAddress,
      amount: amountToSend,
      currency: 'USDC', // Assuming default currency
      timestamp: new Date()
    });

    // Save transaction to database
    await newTransaction.save();

    // Return success message
    return { message: "Transaction completed successfully!" };
  } catch (error) {
    console.error("Error transferring funds:", error);
    return { error: "Unable to transfer. Please try again later." };
  }
}
