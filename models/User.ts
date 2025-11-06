import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "manager", "engineer", "client"], 
      default: "engineer" 
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

export default mongoose.models.User || mongoose.model("User", UserSchema);
