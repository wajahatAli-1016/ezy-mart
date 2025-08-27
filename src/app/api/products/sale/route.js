import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db.js";
import Product from "../../../models/Product.js";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { productId, salePercentage, saleEndDate } = body;

    if (!productId || salePercentage === undefined || !saleEndDate) {
      return NextResponse.json(
        { message: "Validation error: productId, salePercentage, and saleEndDate are required" },
        { status: 400 }
      );
    }

    // Validate sale percentage
    if (salePercentage < 0 || salePercentage > 100) {
      return NextResponse.json(
        { message: "Sale percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Validate sale end date
    const endDate = new Date(saleEndDate);
    if (isNaN(endDate.getTime()) || endDate <= new Date()) {
      return NextResponse.json(
        { message: "Sale end date must be a valid future date" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        salePercentage: salePercentage === 0 ? 0 : salePercentage,
        saleEndDate: salePercentage === 0 ? null : endDate,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("POST /api/products/sale error:", error);
    return NextResponse.json(
      { message: "Failed to apply sale" },
      { status: 500 }
    );
  }
}
