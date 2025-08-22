import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
    ]
  },
  
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);


