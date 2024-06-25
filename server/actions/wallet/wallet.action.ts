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
import { getPlatformWallet, keypairToMnemonic } from "../server-hooks/platformWallet.action";
import { hexToBytes } from "../transactions/utils";
import connectToDB from "@/server/model/database";
import Wallet from "@/server/schemas/wallet";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import TransactionSignature from "@/server/schemas/transactionSignature";

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const ownerStuff = getPlatformWallet();

const ownerSecretBytes = hexToBytes(ownerStuff.secretKey);
const sender = Keypair.fromSecretKey(ownerSecretBytes);

const USDC_DEV_PUBLIC_KEY = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export async function transferSOLForRentFee(receiver: string) {

    const receiverPublicKey = new PublicKey(receiver);

    try {

        // Get the minimum balance required for rent exemption
        const minBalanceForRentExemption = await connection.getMinimumBalanceForRentExemption(0);

        // Create a transaction to transfer the minimum rent exemption amount
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: receiverPublicKey,
                lamports: minBalanceForRentExemption
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
        const userTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sender,
            new PublicKey(USDC_DEV_PUBLIC_KEY),
            new PublicKey(receiverKey),
            true, // Allow creating a token account for the receiver if it doesn't exist
        );

        return { usdcAccount: userTokenAccount.address.toBase58() };
    } catch (error) {
        return { error: error };
    }
}


export async function createWallet(userObject: any) {

    // Generate Keypair
    const wallet = Keypair.generate();

    const mnemonic = await keypairToMnemonic(wallet)

    console.log(mnemonic)

    const publicKey = wallet.publicKey.toBase58();

    const signature = await transferSOLForRentFee(publicKey);

    // Connect to Database
    await connectToDB()

    if (signature.signature) {

        const newSignature = await TransactionSignature.create({
            user: userObject,
            transactionType: 'sent',
            signature: signature.signature,
        })

        const usdcAccount = await createUSDCAccount(publicKey, wallet);

        console.log(usdcAccount);

        if (usdcAccount.usdcAccount) {

            const newWallet = await Wallet.create({
                user: userObject,
                publicKey: publicKey,
                secretKey: mnemonic.secondPart,
                deletedKeyPart: mnemonic.firstPart,
                usdcAddress: usdcAccount.usdcAccount,
            })

            return {
                balance: newWallet.balance,
                publicKey: usdcAccount.usdcAccount,
                secretKey: mnemonic.firstPart
            };
        } else {
            return { error: "Error creating usdc account" }
        }
    } else {
        return { error: "Error transferring rent fee for user" }
    };
}



