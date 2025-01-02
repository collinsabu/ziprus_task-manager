import dbConnect from "@/lib/dbConnect";
import Token from "@/models/Token"; // Adjust the import path for your Token model

export async function deleteInvalidTokens(tokens) {
  try {
    // Connect to the database
    await dbConnect();

    // Delete tokens matching the invalid tokens list
    const result = await Token.deleteMany({ token: { $in: tokens } });

    console.log(`Deleted ${result.deletedCount} invalid tokens.`);
  } catch (error) {
    console.error("Error deleting invalid tokens:", error);
  }
}
