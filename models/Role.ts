import mongoose, { Schema } from "mongoose";

const RoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
