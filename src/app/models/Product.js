import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String, // for product image url
  category: { type: String, default: "", index: true },
  tags: { type: [String], default: [] },
}, { timestamps: true });

// Ensure schema changes apply in dev (Next.js HMR)
if (mongoose.models.Product) {
  mongoose.deleteModel("Product");
}

export default mongoose.model("Product", productSchema);
