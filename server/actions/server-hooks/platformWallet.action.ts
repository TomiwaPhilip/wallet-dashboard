"use server"

import { Keypair } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import { generateMnemonic, mnemonicToEntropy, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
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

export async function mnemonicToKeypairForGeneration() {
    const mnemonic = generateMnemonic(wordlist, 128);

    console.log(mnemonic);

    const seed = mnemonicToSeedSync(mnemonic, "");
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    
    console.log(`${keypair.publicKey.toBase58()}`);
    const publicKey = keypair.publicKey.toBase58();

    const words = mnemonic.split(' ');
    const firstPart = words.slice(0, 6).join(' ');
    const secondPart = words.slice(6).join(' ');
    console.log("firstPart:", " ", firstPart)
    console.log("secondPart:", " ", secondPart)
    console.log("publicKey:", " ", publicKey)

    return {
        firstPart,
        secondPart,
        publicKey,
        keypair,
    }
}

export async function mnemonicToKeypairForRetrieval(firstPart: string, secondPart: string) {
    const mnemonic = `${firstPart} ${secondPart}`

    const seed = mnemonicToSeedSync(mnemonic, "");
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    const pubkey = "Ddw7vp5uxiUVftZou1nnY244MHEBnv8s4E5xNpjfgLkA"
    console.log(keypair.publicKey.toBase58(), "public key from the retrival")
    console.log(pubkey)
    console.log(pubkey === keypair.publicKey.toBase58())
    console.log(Buffer.from(keypair.secretKey).toString('hex'), "secret key from the retrival")

    return keypair;
}
