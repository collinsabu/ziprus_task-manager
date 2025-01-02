import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { deleteInvalidTokens } from "@/lib/deleteInvalidTokens"; // Adjust the import path based on your project structure

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    }),
  });
}

export async function POST(request) {
  const { tokens, title, message, link } = await request.json();

  // Check if tokens are provided
  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ success: false, error: "No tokens provided" });
  }

  // Prepare the message payload for each token
  const messages = tokens.map((token) => ({
    token,
    notification: {
      title,
      body: message,
    },
    webpush: link && {
      fcmOptions: {
        link,
      },
    },
  }));

  try {
    // Send each notification and collect responses
    const responses = await Promise.allSettled(
      messages.map((message) => admin.messaging().send(message))
    );

    // Analyze responses
    const invalidTokens = [];
    const results = responses.map((response, index) => {
      if (response.status === "fulfilled") {
        return { success: true, token: messages[index].token };
      } else {
        console.error(
          `Error sending notification to token ${messages[index].token}:`,
          response.reason
        );

        // Detect invalid tokens
        if (
          response.reason.code === "messaging/registration-token-not-registered" ||
          response.reason.code === "messaging/invalid-registration-token"
        ) {
          invalidTokens.push(messages[index].token);
        }

        return { success: false, token: messages[index].token };
      }
    });

    // Count successes and failures
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    // Cleanup invalid tokens
    if (invalidTokens.length > 0) {
      console.warn(`Invalid tokens detected: ${invalidTokens}`);
      await deleteInvalidTokens(invalidTokens);
    }

    // Return the response
    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successCount} succeeded, ${failureCount} failed`,
      failedTokens: invalidTokens,
    });
  } catch (error) {
    console.error("Unexpected error sending notifications:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
