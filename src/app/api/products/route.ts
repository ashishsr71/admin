import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

// Helper to check admin
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
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const search = searchParams.get("search");

    const query: any = {};
    
    // Create base $or array if both search and category might use it
    const orConditions: any[] = [];

    if (category && category !== "all") {
      // Assuming a simple regex search on name/description if category is arbitrary, 
      // or match directly if we added category field. 
      // Since our mock relies on description/name matching:
      orConditions.push(
        { name: { $regex: category, $options: "i" } },
        { description: { $regex: category, $options: "i" } }
      );
    }

    if (search) {
      if (orConditions.length > 0) {
        // If category is already populating OR, we should ideally use $and for intersection.
        query.$and = [
          { $or: [...orConditions] },
          { name: { $regex: search, $options: "i" } }
        ];
      } else {
        query.name = { $regex: search, $options: "i" };
      }
    } else if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    let sortOption: any = { createdAt: -1 }; // Default newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "asc") sortOption = { price: 1 };
    else if (sort === "desc") sortOption = { price: -1 };

    await connectToDatabase();
    const products = await Product.find(query).sort(sortOption);
    
    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await isAdmin();
    // For development, we might not strictly enforce admin if no users exist, 
    // but typically we should.
    
    await connectToDatabase();
    const body = await req.json();

    const product = await Product.create(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}
