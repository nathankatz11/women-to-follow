"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HandleInput } from "./HandleInput";
import { Button } from "@/components/ui/button";
import type { XLookupResult } from "@/types";

export function NominationForm() {
  const router = useRouter();
  const [handles, setHandles] = useState(["", "", ""]);
  const [profiles, setProfiles] = useState<(XLookupResult | null)[]>([
    null,
    null,
    null,
  ]);
  const [nominatorHandle, setNominatorHandle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((index: number, value: string) => {
    setHandles((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleProfileLoaded = useCallback(
    (index: number, profile: XLookupResult | null) => {
      setProfiles((prev) => {
        const next = [...prev];
        next[index] = profile;
        return next;
      });
    },
    []
  );

  const allValid =
    handles.every((h) => h.trim().length >= 2) &&
    profiles.every((p) => p?.found);

  const canSubmit = handles.every((h) => h.trim().length >= 2);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handles: handles.map((h) => h.replace(/^@/, "").trim()),
          nominatorHandle: nominatorHandle || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit nomination");
      }

      const data = await res.json();
      const params = new URLSearchParams({
        handles: handles.join(","),
        id: data.nominationId,
      });
      router.push(`/nominated?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <HandleInput
            key={i}
            index={i}
            value={handles[i]}
            onChange={handleChange}
            onProfileLoaded={handleProfileLoaded}
          />
        ))}
      </div>

      <div className="max-w-sm mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your X handle (optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            @
          </span>
          <input
            type="text"
            value={nominatorHandle}
            onChange={(e) =>
              setNominatorHandle(e.target.value.replace(/^@/, ""))
            }
            placeholder="your_handle"
            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition-all text-brand-dark bg-white"
          />
        </div>
      </div>

      {error && (
        <p className="text-center text-brand-red font-medium">{error}</p>
      )}

      <div className="text-center">
        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit || submitting}
          className={!allValid && canSubmit ? "opacity-80" : ""}
        >
          {submitting
            ? "Submitting..."
            : allValid
              ? "Nominate These 3 Women"
              : canSubmit
                ? "Submit Nomination"
                : "Enter 3 Handles to Continue"}
        </Button>
        {!allValid && canSubmit && (
          <p className="text-xs text-gray-500 mt-2">
            Some profiles couldn&apos;t be verified, but you can still submit
          </p>
        )}
      </div>
    </form>
  );
}
