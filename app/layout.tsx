import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./providers/providerQuery";
import { AuthProvider } from "./contexts/auth-context";

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
    <ReactQueryProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ReactQueryProvider>
  );
}
