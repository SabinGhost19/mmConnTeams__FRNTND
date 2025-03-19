import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="bg-white"
      style={{
        backgroundColor: "white !important",
        background: "white",
      }}
    >
      <meta name="darkreader-lock" content="true" />
      <body
        className={`${inter.className} bg-white`}
        style={{
          backgroundColor: "white",
          background: "white",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
