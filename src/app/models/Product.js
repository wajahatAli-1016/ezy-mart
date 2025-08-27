import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String, // for product image url
  category: { type: String, default: "", index: true },
  tags: { type: [String], default: [] },
  salePercentage: { type: Number, default: 0, min: 0, max: 100 }, // Sale percentage (0-100)
  saleEndDate: { type: Date, default: null }, // When sale ends
}, { timestamps: true });

// Virtual field for sale price
productSchema.virtual('salePrice').get(function() {
  if (this.salePercentage > 0 && this.saleEndDate && new Date() < this.saleEndDate) {
    return Math.round((this.price * (100 - this.salePercentage)) / 100 * 100) / 100;
  }
  return this.price;
});

// Virtual field to check if product is on sale
productSchema.virtual('isOnSale').get(function() {
  return this.salePercentage > 0 && this.saleEndDate && new Date() < this.saleEndDate;
});

// Ensure virtual fields are included when converting to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Ensure schema changes apply in dev (Next.js HMR)
if (mongoose.models.Product) {
  mongoose.deleteModel("Product");
}

export default mongoose.model("Product", productSchema);
