import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectDB from "@/lib/db";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_for_development";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Please provide email and password" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized: Admins only" },
        { status: 403 }
      );
    }

    // Build user object without password
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    // Sign token
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, {
      expiresIn: "1d",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: userWithoutPassword,
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server error during login" },
      { status: 500 }
    );
  }
}
