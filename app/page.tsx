"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="https://img.icons8.com/fluency/48/000000/microsoft-teams-2019.png"
              alt="Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="text-xl font-bold text-blue-600">MMConnSG</span>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
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

          {/* Mobile menu button */}
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

        {/* Mobile Menu */}
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

      {/* Hero Section with Background Image */}
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
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Connect and Collaborate Seamlessly
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A modern platform for team communication, video conferencing, and
            more.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
            >
              Get Started
            </Link>
            <Link
              href="/learnmore"
              className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section with Images */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 mb-4 relative">
              <Image
                src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Messaging Feature"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-t-lg"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Messaging</h3>
            <p className="text-gray-600">
              Connect with your team through instant messaging and group chats.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 mb-4 relative">
              <Image
                src="https://images.unsplash.com/photo-1609921212029-bb5a28e60960?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Video Conferencing Feature"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-t-lg"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Video Conferencing</h3>
            <p className="text-gray-600">
              Host and join high-quality video meetings with your team from
              anywhere.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 mb-4 relative">
              <Image
                src="https://images.unsplash.com/photo-1576669801775-ff43c5ab079d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Document Sharing Feature"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-t-lg"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Document Sharing</h3>
            <p className="text-gray-600">
              Share and collaborate on documents in real-time with your team.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial Section with Image */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 relative h-80 w-full md:h-96">
              <Image
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Team Collaboration"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg shadow-lg"
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Image
                src="https://img.icons8.com/fluency/48/000000/microsoft-teams-2019.png"
                alt="Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-xl font-bold text-white">MMConnSG</span>
            </div>
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2023 MMConnSG. All rights reserved.
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
