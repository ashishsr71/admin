import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    // Assuming admin authorization would happen here
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

  export async function POST(req: Request) {
    try {
      await connectToDatabase();
      const body = await req.json();
      
      // Auto-populate user details if missing
      if (!body.fullName || !body.email) {
        const User = mongoose.models.User;
        const user = await User.findById(body.userId);
        if (user) {
          body.fullName = user.name;
          body.email = user.email;
        } else {
          return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
      }
  
      const order = await Order.create(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create order", error: error.message },
      { status: 500 }
    );
  }
}
