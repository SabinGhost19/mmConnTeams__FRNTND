// pages/chat.tsx
import React from "react";
import Head from "next/head";
import Header from "./components/Head";
import ChatDemo from "./components/ChatDemo";
import ChatFeatures from "./components/ChatFeatures";
import Footer from "./components/Footer";
import FAQ from "./components/FAQ";

export default function ChatLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Head>
        <title>Chat Asistență | Numele Companiei</title>
        <meta name="description" content="Serviciu de asistență prin chat" />
        <meta name="darkreader-lock" content="true" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Partea stângă - Text și info */}
          <ChatFeatures />

          {/* Partea dreaptă - Widget chat */}
          <ChatDemo />
        </div>

        {/* Secțiunea FAQ */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
