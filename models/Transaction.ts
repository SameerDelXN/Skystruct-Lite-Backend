import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Type of transaction (extended for UI)
    type: {
      type: String,
      enum: ["purchase", "expense", "payment_in", "payment_out", "invoice", "debit_note"],
      required: true,
    },

    // Purchase or invoice fields
    vendorName: { type: String },
    invoiceNumber: { type: String },
    invoiceDate: { type: Date },

    // Payment fields
    paymentMode: { type: String, enum: ["cash", "bank_transfer", "upi", "cheque"], default: "cash" },
    referenceNumber: { type: String },
    paymentDate: { type: Date },

    // Linked material (for purchase/consumption)
    materialId: { type: Schema.Types.ObjectId, ref: "Material" },
    items: [
      {
        itemName: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
        remarks: String,
      },
    ],

    // Financial data
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // Documents and notes
    documents: [{ type: String }],
    remarks: { type: String },

    // Status workflow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    // Consumption Limit tracking
    consumptionLimit: {
      limitSetBy: { type: Schema.Types.ObjectId, ref: "User" },
      limitValue: Number,
      usedValue: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
//sample