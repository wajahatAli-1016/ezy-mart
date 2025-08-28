import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db.js";
import Order from "../../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text(); // raw body for signature check
  const sig = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // handle events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Payment completed for session:", session.id);
    try {
      await connectDB();
      const orderId = session?.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { status: "Paid" });
      }
    } catch (err) {
      console.error("Failed updating order after payment:", err);
    }
  } else if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    console.log("✅ PaymentIntent succeeded:", paymentIntent.id);
    try {
      await connectDB();
      const orderId = paymentIntent?.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { status: "Paid" });
      }
    } catch (err) {
      console.error("Failed updating order from payment_intent:", err);
    }
  }

  return NextResponse.json({ received: true });
}
