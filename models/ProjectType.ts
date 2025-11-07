import mongoose, { Schema } from "mongoose";

const ProjectTypeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String, enum: ["Residential", "Commercial", "Industrial", "Infrastructure", "Educational", "Other"], default: "Other" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.ProjectType || mongoose.model("ProjectType", ProjectTypeSchema);
