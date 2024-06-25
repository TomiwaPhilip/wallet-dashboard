"use server"

import { Keypair } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { Buffer } from 'buffer';
import bs58 from 'bs58';


export async function getPlatformWallet() {
    let ownerStuff;

    if (!process.env.publicKey || !process.env.secretKey) {
        return { error: "Invalid Keys" };
    } else {
        ownerStuff = {
            publicKey: process.env.publicKey,
            secretKey: process.env.secretKey,
        };
    };

    return ownerStuff;
}


// Function to convert a key pair to a 12-word mnemonic phrase and divide into two parts
export async function keypairToMnemonic(keypair: Keypair) {
    // Extract the first 32 bytes of the secret key
    const secretKey = keypair.secretKey.slice(0, 32);

    // Generate a 12-word mnemonic phrase from the secret key entropy
    const mnemonic = generateMnemonic(wordlist, 128); // 128 bits for 12 words

    // Split the mnemonic phrase into two parts
    const words = mnemonic.split(' ');
    const firstPart = words.slice(0, 6).join(' ');
    const secondPart = words.slice(6).join(' ');

    // Return an object with the divided parts
    return {
        firstPart,
        secondPart
    };
}


// Function to convert concatenated mnemonic parts back to a secret key in hex format
export async function concatenatedMnemonicToHex(firstPart: string, secondPart: string) {
    // Concatenate the two parts with a space separator
    const mnemonic = `${firstPart} ${secondPart}`;

    // Convert the mnemonic phrase to a seed buffer
    const seed = mnemonicToSeedSync(mnemonic);

    // Derive the seed using the Solana-specific derivation path
    const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString()).key;

    // Generate a key pair from the derived seed
    const keypair = Keypair.fromSeed(derivedSeed);

    // Convert the secret key to a hexadecimal string
    const secretKeyHex = Buffer.from(keypair.secretKey).toString('hex');
    return secretKeyHex;
}