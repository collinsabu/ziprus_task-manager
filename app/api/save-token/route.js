import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect"; // Ensure your database connection utility is configured
import Token from "@/models/Token"; // Mongoose model for tokens
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect(); // Connect to MongoDB

    const { userId, token } = await request.json();

    if (!userId || !token) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    // Check if the token already exists for this user
    const existingToken = await Token.findOne({ userId, token });

    if (!existingToken) {
      // Save the new token
      await Token.create({ userId, token });
    }

    return NextResponse.json({
      success: true,
      message: "Token saved successfully",
    });
  } catch (error) {
    console.error("Error saving token:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
