"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import bgImage from "./bg.jpg"; // Import the image

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Signed in successfully!");
      router.push("/");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center my-10 px-7"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-base_color bg-opacity-90 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-4 text-white">Sign In</h1>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-white">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Sign In
        </button>
        <p className="mt-4 text-center text-white">
          Don't have an account?{" "}
          <a href="/signup" className="text-green-600 underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
