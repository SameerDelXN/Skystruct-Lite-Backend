import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },

    // Role reference (new system)
    roleId: { type: Schema.Types.ObjectId, ref: "Role", default: null },

    // Legacy role field (for backward compatibility)
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
  { timestamps: true }
);

// Migrate: if roleId exists, it takes precedence over role string
UserSchema.virtual("roleName").get(function () {
  if (this.populated("roleId") && this.roleId?.name) return this.roleId.name;
  return this.role;
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
