import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  fcmTokens: { type: [String], default: [] }, // Ensure default array is provided
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
