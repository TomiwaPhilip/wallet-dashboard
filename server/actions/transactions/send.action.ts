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

import { hexToBytes } from "./utils";
import { getPlatformWallet } from "../server-hooks/platformWallet.action";

interface SendFundsToMilestonUserParams {
    receiverEmail: string;
    amount: string;
}

export async function sendFundsToMilestonUser(params: SendFundsToMilestonUserParams) {
    try {
        // Ensure the database connection is established
        await connectToDB();

        // Get the current user session (sender)
        const senderSession = await getSession();
        if (!senderSession || !senderSession.userId) {
            return { error: "Sender is not authenticated" };
        }

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

        // Get receiver user details
        const receiverUser = await User.findOne({ email: params.receiverEmail });
        if (!receiverUser) {
            return { error: "Receiver user not found" };
        }

        // Fetch receiver's wallet
        const receiverWallet = await Wallet.findOne({ user: receiverUser._id });
        if (!receiverWallet) {
            return { error: "Receiver's wallet not found" };
        }

        // Update sender's wallet balance (subtract amount)
        senderWallet.balance -= amountToSend;
        await senderWallet.save();

        // Update receiver's wallet balance (add amount)
        receiverWallet.balance += amountToSend;
        await receiverWallet.save();

        // Log transaction details
        console.log(`Funds transferred from ${senderSession.email} to ${params.receiverEmail}: ${amountToSend}`);

        // Create transaction document
        const newTransaction = new Transaction({
            type: TransactionType.SENT,
            sender: senderSession.userId,
            receiver: receiverUser._id,
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

            console.log(sourceTokenAccount )
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
            return {error: "Error initiating transaction!"}
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
