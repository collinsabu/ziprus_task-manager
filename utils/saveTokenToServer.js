 
import { fetchToken } from "../firebase";// A utility to get the FCM token
import { toast } from "react-toastify";

const saveTokenToServer = async (userId) => {
  try {
    const token = await fetchToken(); // Utility to request FCM token
    if (!token) {
      console.error("No FCM token available");
      return;
    }

    const response = await fetch("/api/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, token }),
    });

    const data = await response.json();
    if (data.success) {
      toast.success("Device registered for notifications!");
    } else {
      toast.error(`Failed to register device: ${data.message}`);
    }
  } catch (error) {
    console.error("Error saving token:", error);
    toast.error("An error occurred while saving the token.");
  }
};

export default saveTokenToServer;
