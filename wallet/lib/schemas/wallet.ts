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
    currency: {
        type: String,
        required: true,
        default: "USDC",
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const Wallet = models.Wallet || model("Walet", WalletSchema);

export default Wallet;