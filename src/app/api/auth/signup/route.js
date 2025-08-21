import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db.js";
import User from "../../../models/User.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const derived = await new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, dk) => (err ? reject(err) : resolve(dk.toString("hex"))));
    });
    const passwordHash = `${salt}:${derived}`;

    const user = await User.create({ name, email, passwordHash });
    const { passwordHash: _ignore, ...userData } = user.toObject();
    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json({ message: "Failed to sign up" }, { status: 500 });
  }
}


