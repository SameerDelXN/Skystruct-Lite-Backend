import mongoose from "mongoose";
const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["purchase", "expense", "payment"], required: true },
    materialId: { type: Schema.Types.ObjectId, ref: "Material" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    date: { type: Date, default: Date.now },
    documents: [{ type: String }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    remarks: { type: String },
    consumptionLimit: {
      limitSetBy: { type: Schema.Types.ObjectId, ref: "User" },
      limitValue: Number,
      usedValue: Number
    }
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
