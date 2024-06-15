import { Schema, model, models, Document, Types } from "mongoose";

// Define enum for transaction type
const TransactionType = Object.freeze({
    RECEIVED: 'received',
    SENT: 'sent'
});

// Define interface for transaction document
interface ITransaction extends Document {
    type: typeof TransactionType[keyof typeof TransactionType];
    receiver: Types.ObjectId | string; // Mixed type for receiver
    sender: Types.ObjectId | string; // Mixed type for sender
    amount: number;
    currency: string;
    timestamp: Date;
}

// Define schema for transaction
const TransactionSchema = new Schema<ITransaction>({
    type: {
        type: String,
        enum: [TransactionType.RECEIVED, TransactionType.SENT],
        required: true
    },
    receiver: {
        type: Schema.Types.Mixed,
        ref: 'User',
        required: function (this: ITransaction) {
            return this.type === TransactionType.RECEIVED;
        }
    },
    sender: {
        type: Schema.Types.Mixed,
        ref: 'User',
        required: function (this: ITransaction) {
            return this.type === TransactionType.SENT;
        }
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Transaction = models.Transaction || model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
