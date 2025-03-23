"use client";

import React, { useState } from "react";
import { useLogin } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
const loginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin();
  const router = useRouter();

  const handleSubmit = () => {
    //call loginMUtatuion
    setError("");
    if (!email || !password) {
      setError("Email Password is not inserted");
    }
    loginMutation.mutate(
      { email, password },
      {
        onError: (error) => {
          setError(error.message || "Autentificare eșuată");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://source.unsplash.com/ram/?technology')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md"></div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl shadow-lg bg-gray-800 text-white border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-6">
          Log in to access your account
        </p>

        <div className="form-control w-full">
          <label className="label text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            className="input input-bordered w-full bg-gray-700 text-white focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-control w-full mt-4">
          <label className="label text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            placeholder="Enter your password"
            className="input input-bordered w-full bg-gray-700 text-white focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <label className="flex items-center text-gray-300">
            <input type="checkbox" className="checkbox checkbox-primary mr-2" />{" "}
            Remember me
          </label>
          <a href="#" className="text-blue-400 hover:underline">
            Forgot Password?
          </a>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {loginMutation.isError && (
          <div className="text-red-500 text-sm">
            {loginMutation.error.message ||
              "A apărut o eroare la autentificare"}
          </div>
        )}
        <button
          className="btn btn-primary w-full mt-6 hover:bg-blue-600 transition"
          onClick={() => handleSubmit()}
        >
          Login
        </button>

        <p className="text-center text-gray-400 mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default loginPage;
