import { Schema, model, models } from "mongoose";

const WalletSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        required: true
    },
    solanaPublicKey: {
        type: String,
        required: true,
    },
    usdcAddress: {
        type: String,
        required: true,
    },
    secretKey: {
        type: String,
        required: true,
    },
    deletedKeyPart: {
        type: String,
        default: null,
    },
    currency: {
        type: String,
        required: true,
        default: "USDC",
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const Wallet = models.Wallet || model("Wallet", WalletSchema);

export default Wallet;