"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiZap, FiMessageSquare, FiShare2, FiClipboard } from "react-icons/fi";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 mr-2">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              TeamSync
            </span>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition duration-300 shadow-md"
            >
              Register
            </Link>
            <Link
              href="/learnmore"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Learn More
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-blue-600 font-medium transition duration-300"
              >
                Register
              </Link>
              <Link
                href="/learnmore"
                className="text-gray-600 hover:text-blue-600 transition duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
            alt="Hero Background"
            fill
            style={{ objectFit: "cover" }}
            quality={100}
            className="opacity-20"
          />
        </div>
        <div className="container relative z-10 mx-auto px-6 py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-3">
                <FiZap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Connect and Collaborate Seamlessly
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              A modern platform for team communication, task management, and
              more
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition duration-300 shadow-md"
              >
                Get Started
              </Link>
              <Link
                href="/learnmore"
                className="px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition duration-300 shadow-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Our Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the powerful tools that make our platform the preferred
            choice for teams around the world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-4">
                <FiMessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              Messaging
            </h3>
            <p className="text-gray-600 text-center">
              Connect with your team through instant messaging and group chats.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 rounded-full p-4">
                <FiClipboard className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              Ticket and Event Assignment
            </h3>
            <p className="text-gray-600 text-center">
              Easily create, assign and track tickets and events for your team
              in real-time.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 rounded-full p-4">
                <FiShare2 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              Document Sharing
            </h3>
            <p className="text-gray-600 text-center">
              Share and collaborate on documents in real-time with your team.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 relative h-80 w-full md:h-96">
              <Image
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Team Collaboration"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-xl shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Designed for Modern Teams
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our platform brings together the best features of communication
                tools, allowing your team to stay connected and collaborate
                efficiently regardless of location.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Experience seamless integration with your favorite productivity
                tools and take your team's efficiency to the next level.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 mr-2">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TeamSync</span>
            </div>
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 TeamSync. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/learnmore"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                About Us
              </Link>
              <Link
                href="/learnmore"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                Features
              </Link>
              <Link
                href="/learnmore"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
