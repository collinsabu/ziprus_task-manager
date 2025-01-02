"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TaskItem from "@/components/TaskItem";
import Modal from "@/components/Modal";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import saveTokenToServer from "@/utils/saveTokenToServer";

const AllTasks = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for data fetching

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const fetchTasks = async () => {
    if (session?.user) {
      try {
        const response = await fetch(`/api/task?user=${session.user.id}`);
        const data = await response.json();
        if (response.ok) {
          const sortedTasks = data.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setTasks(sortedTasks);
        } else {
          toast.error("Failed to fetch tasks");
        }
      } catch (error) {
        toast.error("An error occurred while fetching tasks");
        console.error("Fetch tasks error:", error);
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newTask, userId: session.user.id }),
      });

      if (response.ok) {
        const { task } = await response.json();
        setTasks((prev) => [task, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
        toast.success("Task created successfully!");
        setModalOpen(false);

        // Send push notification after task is created
        handleTestNotification(); // Call the notification function
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("An error occurred while creating the task");
    }
  };

  const handleTestNotification = async () => {
    if (!session?.user) {
      toast.warn("User session not available");
      return;
    }

    try {
      const response = await fetch("/api/fetch-fcm-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.tokens || data.tokens.length === 0) {
        toast.error("No valid FCM tokens found for the user");
        return;
      }

      const sendNotificationResponse = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokens: data.tokens, // Pass array of tokens
          title: "New Task Added",
          message: "A new task has just been added",
          link: "/",
        }),
      });

      const sendNotificationResult = await sendNotificationResponse.json();

      if (sendNotificationResult.success) {
        toast.success("Task Create Notification successful!");
      } else {
        toast.error("Failed to send notification");
      }
    } catch (error) {
      toast.error("An error occurred while sending notification");
      console.error("Notification error:", error);
    }
  };

  const handleEditTask = (updatedTask) => {
    setTasks((prev) =>
      prev
        .map((t) => (t._id === updatedTask._id ? updatedTask : t))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    toast.success("Task updated successfully!");
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks();
    }
  }, [status]);

  // Save the FCM token to the server after the user logs in
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      saveTokenToServer(session.user.id);
    }
  }, [status, session?.user?.id]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base_color">
        <div className="text-center">
          {/* Spinner Animation */}
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 sm:h-24 sm:w-24 text-base_text animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 2v2m6.364 1.636l-1.414 1.414m4.95 4.95h-2M18 12l-1.636 1.636M12 20v2m-6.364-1.636l1.414-1.414M2 12h2M6.364 6.364L7.778 4.95"
              />
            </svg>
          </div>

          {/* Loading Text */}
          <div className="text-4xl sm:text-6xl font-bold text-base_text animate-pulse">
            loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-4 md:px-16 mt-20 py-10 mb-10 bg-base_color min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-xl md:text-2xl font-bold text-base_text">All Tasks</h1>
        <button
          onClick={() => {
            setSelectedTask(null);
            setModalOpen(true);
          }}
          className="bg-base_text text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </motion.div>

      {/* Skeleton Loader while fetching */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="h-24 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {tasks.map((task) => (
            <motion.div
              key={task._id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <TaskItem
                task={task}
                onUpdate={handleEditTask}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          task={selectedTask}
          onClose={() => {
            setModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={selectedTask ? handleEditTask : handleAddTask}
        />
      )}
    </motion.div>
  );
};

export default AllTasks;
