// Import Firebase libraries
import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

// Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Messaging initialization with support check
export const messaging = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Browser does not support Firebase Messaging");
      return null;
    }
    return getMessaging(app);
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
    return null;
  }
};

// Function to fetch FCM token
export const fetchToken = async () => {
  try {
    const m = await messaging();
    if (!m) return null;

    const token = await getToken(m, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
    });

    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching FCM token:", error);
    return null;
  }
};

// Listener for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    messaging()
      .then((m) => {
        if (!m) return;
        onMessage(m, (payload) => {
          resolve(payload);
        });
      })
      .catch((error) => {
        console.error("Error setting up onMessage listener:", error);
      });
  });
