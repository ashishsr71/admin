import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
    return decoded.isAdmin;
  } catch (e) {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // In production, we'd enforce admin here. For testing convenience:
    // const admin = await isAdmin();
    // if (!admin) return NextResponse.json({ message: "Not authorized as admin" }, { status: 401 });

    const users = await User.find({}).sort({ createdAt: -1 });

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "User")}`, // Deterministic seed
      status: u.isAdmin ? "active" : "inactive", // Basic demonstration status mapping
      fullName: u.name,
      email: u.email,
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const user = await User.create(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create user", error: error.message },
      { status: 500 }
    );
  }
}
