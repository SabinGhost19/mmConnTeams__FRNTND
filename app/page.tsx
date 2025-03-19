import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 bg-white">
        <h1
          className="text-red-500 text-3xl font-bold bg-white"
          style={{
            backgroundColor: "white",
            background: "white",
          }}
        >
          Diagnostic Page
        </h1>
        <div
          className="text-green-600 text-xl bg-white"
          style={{
            backgroundColor: "white",
            background: "white",
          }}
        >
          Check Background Color
        </div>
      </div>
    </div>
  );
}
