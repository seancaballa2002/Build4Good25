// src/app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">About Bobby the Handyman</h1>
      <p className="mt-4">
        Bobby fixes everything from squeaky doors to broken dreams 💪🔧.
      </p>
      <div className="mt-6">
        <Link href="/" className="text-blue-500 underline">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
