"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { HandleInput } from "./HandleInput";
import { Button } from "@/components/ui/button";
import { ShareToX } from "@/components/share/ShareToX";
import { formatNumber } from "@/lib/utils";
import type { XLookupResult } from "@/types";

export function NominationForm() {
  const [handles, setHandles] = useState(["", "", ""]);
  const [profiles, setProfiles] = useState<(XLookupResult | null)[]>([
    null,
    null,
    null,
  ]);
  const [reasons, setReasons] = useState(["", "", ""]);
  const [nominatorHandle, setNominatorHandle] = useState("");
  const [nominatorProfile, setNominatorProfile] = useState<XLookupResult | null>(null);
  const [nominatorLoading, setNominatorLoading] = useState(false);
  const [nominatorError, setNominatorError] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedHandles, setSubmittedHandles] = useState<string[]>([]);

  const handleChange = useCallback((index: number, value: string) => {
    setHandles((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleReasonChange = useCallback((index: number, value: string) => {
    setReasons((prev) => {
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

  const filledHandles = handles.filter((h) => h.trim().length >= 2);
  const filledProfiles = profiles.filter((_, i) => handles[i].trim().length >= 2);
  const allValid =
    filledHandles.length >= 1 &&
    filledProfiles.every((p) => p?.found);

  const nominatorClean = nominatorHandle.replace(/^@/, "").trim();
  const nominatorValid = anonymous || nominatorProfile?.found === true;
  const canLookupNominator = nominatorClean.length >= 2 && !nominatorLoading && !nominatorProfile;
  const canSubmit = filledHandles.length >= 1 && nominatorValid;

  async function lookupNominator() {
    if (nominatorClean.length < 2) return;
    setNominatorLoading(true);
    setNominatorError(null);
    try {
      const res = await fetch(`/api/x/lookup?handle=${encodeURIComponent(nominatorClean)}&preview=true`);
      const data = await res.json();
      if (data.found) {
        setNominatorProfile(data);
      } else {
        setNominatorProfile(null);
        setNominatorError("User not found");
      }
    } catch {
      setNominatorError("Lookup failed");
    } finally {
      setNominatorLoading(false);
    }
  }

  function resetForm() {
    setHandles(["", "", ""]);
    setProfiles([null, null, null]);
    setReasons(["", "", ""]);
    setNominatorHandle("");
    setNominatorProfile(null);
    setNominatorLoading(false);
    setNominatorError(null);
    setAnonymous(false);
    setError(null);
    setSubmitted(false);
    setSubmittedHandles([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const cleaned = handles
        .map((h, i) => ({
          handle: h.replace(/^@/, "").trim(),
          reason: reasons[i]?.trim() || "",
        }))
        .filter((entry) => entry.handle.length >= 2);

      const res = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handles: cleaned.map((e) => e.handle),
          reasons: cleaned.map((e) => e.reason),
          nominatorHandle: anonymous ? undefined : nominatorHandle || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit nomination");
      }

      setSubmittedHandles(cleaned.map((e) => e.handle));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
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

        <h3 className="text-3xl md:text-4xl font-bold text-brand-dark mb-3">
          Amazing!
        </h3>
        <p className="text-lg text-gray-600 mb-2">
          You nominated {submittedHandles.length} incredible {submittedHandles.length === 1 ? "woman" : "women"}.
        </p>

        {submittedHandles.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {submittedHandles.map((h) => (
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

        <div className="space-y-6">
          {submittedHandles.length > 0 && <ShareToX handles={submittedHandles} />}

          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" size="sm" onClick={resetForm}>
              Nominate More
            </Button>
            <a href="#directory">
              <Button variant="ghost" size="sm">
                Browse Directory
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <HandleInput
            key={i}
            index={i}
            value={handles[i]}
            reason={reasons[i]}
            onChange={handleChange}
            onReasonChange={handleReasonChange}
            onProfileLoaded={handleProfileLoaded}
          />
        ))}
      </div>

      <div className="max-w-sm mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your X handle
        </label>
        {anonymous ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50">
            <span className="text-gray-400 text-sm">Nominating anonymously</span>
            <button
              type="button"
              onClick={() => setAnonymous(false)}
              className="text-xs text-brand-red hover:underline cursor-pointer"
            >
              Add my handle
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                @
              </span>
              <input
                type="text"
                value={nominatorHandle}
                onChange={(e) => {
                  const val = e.target.value.replace(/^@/, "");
                  setNominatorHandle(val);
                  if (nominatorProfile && val.trim().toLowerCase() !== nominatorProfile.handle.toLowerCase()) {
                    setNominatorProfile(null);
                    setNominatorError(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (canLookupNominator) lookupNominator();
                  }
                }}
                placeholder="your_handle"
                className={`w-full pl-9 pr-12 py-3 border-2 outline-none transition-all text-brand-dark bg-white ${
                  nominatorProfile
                    ? "rounded-t-xl border-b-0 border-brand-yellow/50"
                    : "rounded-xl border-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {nominatorLoading ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : nominatorProfile ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : canLookupNominator ? (
                  <button
                    type="button"
                    onClick={lookupNominator}
                    className="w-8 h-8 rounded-lg bg-brand-yellow hover:bg-brand-yellow/80 flex items-center justify-center transition-colors"
                    title="Look up your profile"
                  >
                    <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>
            {nominatorError && (
              <p className="text-sm text-brand-red mt-2">{nominatorError}</p>
            )}
            {nominatorProfile && (
              <div className="border-2 border-t-0 border-brand-yellow/50 rounded-b-xl bg-brand-cream/30 overflow-hidden">
                <div className="p-3 flex items-center gap-3">
                  {nominatorProfile.profileImageUrl ? (
                    <Image
                      src={nominatorProfile.profileImageUrl}
                      alt={nominatorProfile.name}
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-brand-yellow/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-dark font-bold text-sm">
                      {nominatorClean[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-dark text-sm truncate">{nominatorProfile.name}</p>
                    <p className="text-xs text-gray-500">
                      @{nominatorProfile.handle}
                      {nominatorProfile.followerCount != null && (
                        <span className="text-gray-400 ml-2">{formatNumber(nominatorProfile.followerCount)} followers</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setAnonymous(true);
                setNominatorProfile(null);
                setNominatorError(null);
              }}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Keep anonymous
            </button>
          </>
        )}
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
              ? `Nominate ${filledHandles.length === 1 ? "1 Woman" : `These ${filledHandles.length} Women`}`
              : canSubmit
                ? "Submit Nomination"
                : "Enter at Least 1 Handle to Continue"}
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
