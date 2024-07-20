import mongoose, { Document, Schema } from "mongoose";

// Define the PaymentLink interface
interface PaymentLink extends Document {
  amount: string;
  title: string;
  description?: string;
  redirectUrl?: string;
  customerInfo?: string;
  bannerImage?: string;
  logoImage?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  receiverUser: mongoose.Types.ObjectId;
  payerUser?: mongoose.Types.ObjectId[]; // Optional array of ObjectIds
  createdAt: Date;
  status: string;
}

// Define the schema
const PaymentLinkSchema: Schema = new Schema(
  {
    amount: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    redirectUrl: { type: String, required: false },
    customerInfo: { type: String, required: true },
    bannerImage: { type: String, required: false },
    logoImage: { type: String, required: false },
    backgroundColor: { type: String, required: false },
    foregroundColor: { type: String, required: false },
    textColor: { type: String, required: false },
    buttonColor: { type: String, required: false },
    receiverUser: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payerUser: [
      { type: mongoose.Types.ObjectId, ref: "User", required: false },
    ],
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "expired"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Export the model
const PaymentLinkModel = mongoose.model<PaymentLink>(
  "PaymentLink",
  PaymentLinkSchema,
);

export default PaymentLinkModel;
