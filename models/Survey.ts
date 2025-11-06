import mongoose from "mongoose";
const { Schema } = mongoose;

const SurveySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String },
    documents: [{ type: String }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema);
