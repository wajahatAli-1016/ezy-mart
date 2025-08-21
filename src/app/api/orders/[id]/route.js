import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db.js";
import Order from "../../../models/Order.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error(`GET /api/orders/${params?.id} error:`, error);
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const data = await req.json();
    const order = await Order.findByIdAndUpdate(params.id, data, { new: true });
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    console.error(`PUT /api/orders/${params?.id} error:`, error);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}


