// /api/cart/route.js
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth"; // if using next-auth

export async function POST(req) {
  await connectDB();
  const session = await getServerSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { productId, qty } = await req.json();

  let cart = await Cart.findOne({ userId: session.user.id });
  if (!cart) cart = await Cart.create({ userId: session.user.id, items: [] });

  const existing = cart.items.find((i) => i.productId.toString() === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId, qty });
  }

  await cart.save();
  return Response.json(cart);
}
