import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"; // Use the dbConnect to connect to DB
import Token from "@/models/Token"; // Assuming Token model is exported from "@/models/Token"

export async function POST(request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" });
  }

  try {
    console.log("Connecting to DB...");
    // Ensure DB connection before running queries
    await dbConnect();

    // Query using Mongoose model instead of native MongoDB driver
    const tokens = await Token.find({ userId });

    console.log("Tokens retrieved:", tokens);

    if (tokens.length === 0) {
      return NextResponse.json({ success: false, tokens: [] });
    }

    return NextResponse.json({
      success: true,
      tokens: tokens.map((token) => token.token), // Corrected field
    });
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tokens" });
  }
}
