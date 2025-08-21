import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db.js";
import User from "../../../models/User.js";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    let user = await User.findOne({ email });

    // Auto-provision admin user if not exists (for demo/dev convenience)
    if (!user && email === "wajahataliq1224@gmail.com") {
      const salt = crypto.randomBytes(16).toString("hex");
      const derived = await new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, dk) => (err ? reject(err) : resolve(dk.toString("hex"))));
      });
      const passwordHash = `${salt}:${derived}`;
      user = await User.create({ name: "Admin", email, passwordHash });
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const [salt, stored] = user.passwordHash.split(":");
    if (!salt || !stored) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    const derived = await new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, dk) => (err ? reject(err) : resolve(dk.toString("hex"))));
    });
    if (derived !== stored) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const { passwordHash: _ignore, ...userData } = user.toObject();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ message: "Failed to login" }, { status: 500 });
  }
}


