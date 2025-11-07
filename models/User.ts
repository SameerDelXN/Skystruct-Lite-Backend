import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },

    // ✅ New Role Reference (RBAC support)
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },

    // ✅ Legacy field (for backward compatibility)
    role: {
      type: String,
      enum: ["admin", "manager", "engineer", "client"],
      default: "engineer",
    },

    designation: { type: String },
    profileImage: { type: String },
    assignedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    lastLogin: { type: Date },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Virtual: Get human-readable role name
UserSchema.virtual("roleName").get(function () {
  if (this.populated("roleId") && (this as any).roleId?.name)
    return (this as any).roleId.name;
  return this.role;
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
