"use server";

import {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import { getPlatformWallet, mnemonicToKeypairForGeneration } from "../server-hooks/platformWallet.action";
import { hexToBytes } from "../transactions/utils";
import connectToDB from "@/server/model/database";
import Wallet from "@/server/schemas/wallet";
import { createAssociatedTokenAccount, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import TransactionSignature from "@/server/schemas/transactionSignature";

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const USDC_DEV_PUBLIC_KEY = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export async function transferSOLForRentFee(receiver: string) {

    const receiverPublicKey = new PublicKey(receiver);

    const ownerStuff = await getPlatformWallet();

    const ownerSecretBytes = hexToBytes(ownerStuff.secretKey);
    const sender = Keypair.fromSecretKey(ownerSecretBytes);

    try {

        // Get the minimum balance required for rent exemption
        const minBalanceForRentExemption = await connection.getMinimumBalanceForRentExemption(0);

        // Create a transaction to transfer the minimum rent exemption amount
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: receiverPublicKey,
                lamports: 0.1 * LAMPORTS_PER_SOL
            })
        );

        // Sign and send the transaction
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [sender]
        );

        return { signature: signature };
    } catch (error) {
        console.error(error);
        return { error: error };
    }

}


export async function createUSDCAccount(receiverKey: string, sender: Keypair) {

    try {

        // Fetch or create the receiver's associated token account for USDC
        const userTokenAccount = await createAssociatedTokenAccount(
            connection,
            sender,
            new PublicKey(USDC_DEV_PUBLIC_KEY),
            new PublicKey(receiverKey),
        );

        return { usdcAccount: userTokenAccount.toBase58() };
    } catch (error) {
        return { error: error };
    }
}


export async function createWallet(userObject: any) {
    console.log(userObject)
    // Generate Wallet
    const wallet = await mnemonicToKeypairForGeneration();

    console.log(wallet);

    const publicKey = wallet.publicKey;

    const signature = await transferSOLForRentFee(publicKey);

    console.log(signature.signature);

    // Connect to Database
    await connectToDB()

    if (signature.signature) {

        const newSignature = await TransactionSignature.create({
            user: userObject,
            transactionType: 'sent',
            signature: signature.signature,
        })

        const usdcAccount = await createUSDCAccount(publicKey, wallet.keypair);

        console.log(usdcAccount);

        if (usdcAccount.usdcAccount) {

            const newWallet = await Wallet.create({
                user: userObject,
                solanaPublicKey: publicKey,
                secretKey: wallet.secondPart,
                deletedKeyPart: wallet.firstPart,
                usdcAddress: usdcAccount.usdcAccount,
            })

            if(newWallet) console.log(newWallet);

            return {
                balance: newWallet.balance,
                publicKey: usdcAccount.usdcAccount,
                solanaAddress: publicKey,
            };
        } else {
            return { error: "Error creating usdc account" }
        }
    } else {
        return { error: "Error transferring rent fee for user" }
    };
}