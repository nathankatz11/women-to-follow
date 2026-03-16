import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-6xl font-extrabold text-brand-red mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          This page doesn&apos;t exist yet.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/nominate">
            <Button variant="outline">Nominate</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
