import { Schema, model, models, Document, Types } from "mongoose";

// Define enum for transaction type
const TransactionType = Object.freeze({
    RECEIVED: 'received',
    SENT: 'sent'
});

// Define interface for transaction signature document
interface ITransactionSignature extends Document {
    user: Types.ObjectId;
    transactionType: typeof TransactionType[keyof typeof TransactionType];
    signature: string;
    timestamp: Date;
}

// Define schema for transaction signature
const TransactionSignatureSchema = new Schema<ITransactionSignature>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionType: {
        type: String,
        enum: [TransactionType.RECEIVED, TransactionType.SENT],
        required: true
    },
    signature: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Check if the model already exists before defining it
const TransactionSignature = models.TransactionSignature || model<ITransactionSignature>("TransactionSignature", TransactionSignatureSchema);

export default TransactionSignature;
