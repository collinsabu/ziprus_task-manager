// utils/notifications.js

import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json"; // Path to your Firebase private key

// Check if the app is already initialized
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

// Function to send push notifications
export const sendNotification = async (tokens, title, body) => {
  const message = {
    notification: { title, body },
    tokens: Array.isArray(tokens) ? tokens : [tokens], // Ensure tokens are in an array
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log("Notifications sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error.message);
  }
};

export default admin;
