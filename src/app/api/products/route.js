import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db.js";
import Product from "../../models/Product.js";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") || "").trim();
    const q = (searchParams.get("q") || "").trim();
    const tagsParam = (searchParams.get("tags") || "").trim();

    const query = {};
    if (category) query.category = category;

    const tags = tagsParam
      ? tagsParam
          .split(/[,\n]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        // For arrays of strings, $regex directly on the field matches any element
        { tags: { $regex: regex } },
        { category: { $regex: regex } },
      ];
    }

    const products = await Product.find(query);
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, description, price, stock, image } = body || {};
    let { category, tags } = body || {};

    const parsedPrice = price === undefined || price === null || price === "" ? NaN : Number(price);
    const parsedStock = stock === undefined || stock === null || stock === "" ? 0 : Number(stock);

    if (!name || Number.isNaN(parsedPrice)) {
      return NextResponse.json(
        { message: "Validation error: 'name' and numeric 'price' are required" },
        { status: 400 }
      );
    }

    // Normalize category
    if (typeof category !== "string") category = "";
    category = category.trim();

    // Normalize tags (support comma-separated string or array)
    if (typeof tags === "string") {
      tags = tags
        .split(/[,\n]/)
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      tags = tags.map((t) => String(t).trim()).filter(Boolean);
    } else {
      tags = [];
    }

    const product = await Product.create({
      name,
      description,
      price: parsedPrice,
      stock: Number.isNaN(parsedStock) ? 0 : parsedStock,
      image,
      category,
      tags,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
