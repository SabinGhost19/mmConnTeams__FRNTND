"use client";

import React, { useState } from "react";
import { useLogin } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

const loginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin();
  const router = useRouter();

  const handleSubmit = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden px-4 sm:px-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl bg-gray-800/80 backdrop-blur-lg text-white border border-gray-700/50 mx-auto transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FiUser className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-center text-gray-400 mt-2 text-sm sm:text-base">
            Log in to access your account
          </p>
        </div>

        <div className="space-y-4">
          <div className="form-control w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                className="input input-bordered w-full bg-gray-700/50 text-white focus:outline-none pl-12 py-4 text-base sm:text-lg rounded-xl border-gray-600 focus:border-blue-500 transition-colors"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                className="input input-bordered w-full bg-gray-700/50 text-white focus:outline-none pl-12 py-4 text-base sm:text-lg rounded-xl border-gray-600 focus:border-blue-500 transition-colors"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2 sm:gap-0">
            <label className="flex items-center text-gray-300 cursor-pointer group">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mr-2 transition-colors"
              />
              <span className="group-hover:text-blue-400 transition-colors">
                Remember me
              </span>
            </label>
            <a
              href="#"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800/50">
              {error}
            </div>
          )}
          {loginMutation.isError && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800/50">
              {loginMutation.error.message ||
                "A apărut o eroare la autentificare"}
            </div>
          )}

          <button
            className="btn w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-xl py-4 text-base sm:text-lg"
            onClick={() => handleSubmit()}
          >
            Login
          </button>

          <p className="text-center text-gray-400 mt-4 text-sm sm:text-base">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default loginPage;
