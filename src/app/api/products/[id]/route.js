import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db.js";
import Product from "../../../models/Product.js";

export async function GET(req, { params }) {
  try {
    const {id} = await params
    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`GET /api/products/${params?.id} error:`, error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}
  
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const data = await req.json();
    const { price, stock } = data || {};
    const parsed = {
      ...data,
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(stock !== undefined ? { stock: Number(stock) } : {}),
    };

    // Normalize category
    if (parsed.category !== undefined) {
      parsed.category = String(parsed.category || "").trim();
    }

    // Normalize tags
    if (parsed.tags !== undefined) {
      if (typeof parsed.tags === "string") {
        parsed.tags = parsed.tags
          .split(/[,\n]/)
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (Array.isArray(parsed.tags)) {
        parsed.tags = parsed.tags.map((t) => String(t).trim()).filter(Boolean);
      } else {
        parsed.tags = [];
      }
    }

    const product = await Product.findByIdAndUpdate(params.id, parsed, { new: true });
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`PUT /api/products/${params?.id} error:`, error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error(`DELETE /api/products/${params?.id} error:`, error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
