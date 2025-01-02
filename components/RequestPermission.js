// components/RequestPermission.js
"use client";

import { messaging } from "@/utils/firebase";
import { getToken } from "firebase/messaging";
import { useEffect } from "react";

const RequestPermission = () => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");
          const token = await getToken(messaging, {
            vapidKey: "YOUR_VAPID_KEY", // Get this from Firebase Console > Cloud Messaging > Web Push certificates
          });
          console.log("FCM Token:", token);
          // Send this token to your backend to save for the user
        } else {
          console.error("Notification permission denied.");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          console.log("Service Worker Registered");
        } catch (error) {
          console.error("Service Worker Registration Failed:", error);
        }
      }
    };

    requestPermission();
    registerServiceWorker();
  }, []);

  return null; // This is just for requesting permissions
};

export default RequestPermission;
