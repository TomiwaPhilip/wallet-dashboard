import { Schema, model, models } from "mongoose";

const MemoSchema = new Schema({
    memo: {
        type: String,
        unique: true,
        default: null,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User collection
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Memo = models.Memo || model("Memo", MemoSchema);

export default Memo;
