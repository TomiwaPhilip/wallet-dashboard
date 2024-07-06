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
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export function ensure<T>(argument: T | undefined | null): T {
    if (argument === undefined || argument === null) {
        throw new TypeError("This value was promised to be there.");
    }

    return argument;
}

export function hexToBytes(hex: any) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return new Uint8Array(bytes);
}

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const USDC_DEV_PUBLIC_KEY = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export async function fetchBalanceFromChain(owner: string) {

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

    return balance;
}

/**
 * Converts a string to BigInt.
 * @param {string} str - The string to convert.
 * @returns {BigInt} - The converted BigInt.
 * @throws {Error} - Throws an error if the input is not a valid string representation of a number.
 */
export function stringToBigInt(str: string) {
    try {
      // Attempt to convert the string to a BigInt
      const bigIntValue = BigInt(str);
      return bigIntValue;
    } catch (error) {
      // If conversion fails, throw an error
      throw new Error(`Invalid input: ${str} cannot be converted to BigInt`);
    }
  }