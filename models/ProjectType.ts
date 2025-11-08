import mongoose, { Schema } from "mongoose";

const ProjectTypeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String }, // e.g. Residential / Commercial
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ProjectType || mongoose.model("ProjectType", ProjectTypeSchema);
