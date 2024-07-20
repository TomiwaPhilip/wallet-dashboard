import mongoose, { Document, Schema } from "mongoose";

// Define the Invoice interface
interface Invoice extends Document {
  amountDue: number;
  itemName: string;
  customerEmail: string;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  receiverUser: mongoose.Types.ObjectId;
  payerUser: mongoose.Types.ObjectId;
}

// Define the schema
const InvoiceSchema: Schema = new Schema(
  {
    amountDue: { type: Number, required: true },
    itemName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    receiverUser: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payerUser: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// Export the model
const InvoiceModel = mongoose.model<Invoice>("Invoice", InvoiceSchema);

export default InvoiceModel;
