import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db.js";
import Order from "../../models/Order.js";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const query = userId ? { user: userId } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, items, totalAmount } = body || {};
    if (!userId || !Array.isArray(items) || items.length === 0 || typeof totalAmount !== "number") {
      return NextResponse.json({ message: "Invalid order payload" }, { status: 400 });
    }
    const order = await Order.create({ user: userId, items, totalAmount });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}


