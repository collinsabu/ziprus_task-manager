import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
  token: {
    type: String, // Use "token" as the field name, not "fcmToken"
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model, creating it if it doesn't already exist
export default mongoose.models.Token || mongoose.model("Token", TokenSchema);
