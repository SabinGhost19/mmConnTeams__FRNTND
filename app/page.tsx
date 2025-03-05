import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1 className="text-red-500">Salut Hello</h1>
      <div className="text-green-600">Numele este</div>
      <Link href={"/users"}>Click here for Users</Link>
    </main>
  );
}
