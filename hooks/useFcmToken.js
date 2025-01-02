// Import necessary modules
const { useEffect, useRef, useState } = require("react");
const { getToken, onMessage } = require("firebase/messaging");
const { fetchToken, messaging } = require("../firebase");
const { useRouter } = require("next/navigation");
const { toast } = require("sonner");

// Function to get notification permission and FCM token
async function getNotificationPermissionAndToken() {
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  if (Notification.permission === "granted") {
    return await fetchToken();
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await fetchToken();
    }
  }

  console.log("Notification permission not granted.");
  return null;
}

// Custom hook for FCM token and notifications
function useFcmToken() {
  const router = useRouter();
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState(null);
  const [token, setToken] = useState(null);
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false);

  const loadToken = async () => {
    if (isLoading.current) return;

    isLoading.current = true;
    const fetchedToken = await getNotificationPermissionAndToken();

    if (Notification.permission === "denied") {
      setNotificationPermissionStatus("denied");
      console.info("Push Notifications issue - permission denied");
      isLoading.current = false;
      return;
    }

    if (!fetchedToken) {
      if (retryLoadToken.current >= 3) {
        alert("Unable to load token, refresh the browser");
        console.info("Push Notifications issue - unable to load token after 3 retries");
        isLoading.current = false;
        return;
      }

      retryLoadToken.current += 1;
      console.error("An error occurred while retrieving token. Retrying...");
      isLoading.current = false;
      await loadToken();
      return;
    }

    setNotificationPermissionStatus(Notification.permission);
    setToken(fetchedToken);
    isLoading.current = false;
  };

  useEffect(() => {
    if ("Notification" in window) {
      loadToken();
    }
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      if (!token) return;

      console.log(`onMessage registered with token ${token}`);
      const m = await messaging();
      if (!m) return;

      const unsubscribe = onMessage(m, (payload) => {
        if (Notification.permission !== "granted") return;

        console.log("Foreground push notification received:", payload);
        const link = payload.fcmOptions?.link || payload.data?.link;

        if (link) {
          toast.info(
            `${payload.notification?.title}: ${payload.notification?.body}`,
            {
              action: {
                label: "Visit",
                onClick: () => {
                  const notificationLink = payload.fcmOptions?.link || payload.data?.link;
                  if (notificationLink) {
                    router.push(notificationLink);
                  }
                },
              },
            }
          );
        } else {
          toast.info(`${payload.notification?.title}: ${payload.notification?.body}`);
        }

        const notification = new Notification(
          payload.notification?.title || "New message",
          {
            body: payload.notification?.body || "This is a new message",
            data: link ? { url: link } : undefined,
          }
        );

        notification.onclick = (event) => {
          event.preventDefault();
          const notificationLink = event.target?.data?.url;
          if (notificationLink) {
            router.push(notificationLink);
          } else {
            console.log("No link found in the notification payload");
          }
        };
      });

      return unsubscribe;
    };

    let unsubscribe = null;

    setupListener().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [token, router]);

  return { token, notificationPermissionStatus };
}

module.exports = useFcmToken;
