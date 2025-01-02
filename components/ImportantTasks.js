"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TaskItem from "@/components/TaskItem";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ImportantTasks = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const fetchImportantTasks = async () => {
    if (session?.user) {
      try {
        const response = await fetch(
          `/api/task/important?user=${session.user.id}&status=important`
        );
        const data = await response.json();
        if (response.ok) {
          const sortedTasks = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setTasks(sortedTasks);
        } else {
          toast.error("Failed to fetch important tasks");
        }
      } catch (error) {
        console.error("Error fetching important tasks:", error);
        toast.error("An error occurred while fetching tasks");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    }
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((prev) =>
      prev
        .map((t) => (t._id === updatedTask._id ? updatedTask : t))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    toast.success("Task updated successfully!");
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) =>
      prev.filter((task) => task._id !== taskId).sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    toast.success("Task deleted successfully!");
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchImportantTasks();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base_color">
        <div className="text-center">
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
          <div className="text-4xl sm:text-6xl font-bold text-base_text animate-pulse">
            loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-4 md:px-16 py-10 bg-base_color my-10 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }} // Exit animation
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-base_text">Important Tasks</h1>
      </div>

      {tasks.length === 0 ? (
        <motion.div
          className="flex justify-center items-center text-lg text-gray-600 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p>No important tasks at the moment</p>
        </motion.div>
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
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TaskItem
                task={task}
                onDelete={() => handleDeleteTask(task._id)}
                onUpdate={handleUpdateTask}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImportantTasks;
