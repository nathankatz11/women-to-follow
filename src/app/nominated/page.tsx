"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ShareToX } from "@/components/share/ShareToX";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function NominatedContent() {
  const searchParams = useSearchParams();
  const handlesParam = searchParams.get("handles") ?? "";
  const handles = handlesParam.split(",").filter(Boolean);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-cream to-white flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 py-12 text-center">
        <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-brand-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-3">
          Amazing!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          You nominated 3 incredible women.
        </p>

        {handles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {handles.map((h) => (
              <span
                key={h}
                className="bg-white px-4 py-2 rounded-full text-sm font-medium text-brand-dark shadow-sm border border-gray-100"
              >
                @{h}
              </span>
            ))}
          </div>
        )}

        <p className="text-gray-500 mb-8">
          Now share your nominations on X to keep the chain going!
        </p>

        <div className="space-y-4">
          {handles.length > 0 && <ShareToX handles={handles} />}

          <div className="flex gap-3 justify-center">
            <Link href="/nominate">
              <Button variant="outline" size="sm">
                Nominate More
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="ghost" size="sm">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function NominatedPage() {
  return (
    <Suspense>
      <NominatedContent />
    </Suspense>
  );
}
