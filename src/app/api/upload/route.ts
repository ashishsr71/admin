import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";



export async function POST(req: Request) {
  try {
    // Dynamically configure inside request to bypass Next.js module caching
    // after user edits .env.local without a hard server restart
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const color = data.get("color") as string;

    if (!file) {
      return NextResponse.json(
        { message: "No file was provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary via stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "ecommerce_products", public_id: `${color}-${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Write the buffer to the stream
      uploadStream.end(buffer);
    });

    // Return the secure Cloudinary URL back to frontend
    return NextResponse.json({ 
      success: true, 
      url: uploadResult.secure_url 
    });

  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { message: "Cloud upload failed", error: error.message },
      { status: 500 }
    );
  }
}
