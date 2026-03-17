"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ProfilePreview } from "./ProfilePreview";
import type { XLookupResult } from "@/types";

const PROMPTS = [
  "What makes her voice important?",
  "How is she driving change?",
  "Why should people follow her?",
];

// Women interviewed/featured by Rose Horowitz on #WomenToFollow
const EXAMPLE_HANDLES = [
  "AndreaChalupa",
  "LinaAbiRafeh",
  "gailfbecker",
  "shiralazar",
  "lizadonnelly",
  "BobbieWasserman",
];

interface HandleInputProps {
  index: number;
  value: string;
  reason: string;
  onChange: (index: number, value: string) => void;
  onReasonChange: (index: number, value: string) => void;
  onProfileLoaded: (index: number, profile: XLookupResult | null) => void;
}

export function HandleInput({
  index,
  value,
  reason,
  onChange,
  onReasonChange,
  onProfileLoaded,
}: HandleInputProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<XLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotating placeholder with handles from Rose's interviews
  useEffect(() => {
    // Each slot starts at a different offset so all 3 show different names
    let tick = index * 2;
    setPlaceholder(EXAMPLE_HANDLES[tick % EXAMPLE_HANDLES.length]);

    intervalRef.current = setInterval(() => {
      tick++;
      setPlaceholder(EXAMPLE_HANDLES[tick % EXAMPLE_HANDLES.length]);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index]);

  const cleanValue = value.replace(/^@/, "").trim();
  const canLookup = cleanValue.length >= 2 && !loading;

  const lookupHandle = useCallback(
    async () => {
      const handle = value.replace(/^@/, "").trim();
      if (!handle || handle.length < 2) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/x/lookup?handle=${encodeURIComponent(handle)}`
        );
        const data = await res.json();

        if (data.found) {
          setProfile(data);
          onProfileLoaded(index, data);
        } else {
          setProfile(null);
          setError("User not found");
          onProfileLoaded(index, null);
        }
      } catch {
        setError("Lookup failed");
        onProfileLoaded(index, null);
      } finally {
        setLoading(false);
      }
    },
    [index, value, onProfileLoaded]
  );

  return (
    <div className="space-y-0">
      {/* Handle input with inline confirm button */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          @
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const newVal = e.target.value.replace(/^@/, "");
            onChange(index, newVal);
            // If the profile was loaded but handle changed, clear it
            if (profile && newVal.trim().toLowerCase() !== profile.handle.toLowerCase()) {
              setProfile(null);
              setError(null);
              onProfileLoaded(index, null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (canLookup && !profile) lookupHandle();
            }
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-12 py-3 border-2 outline-none transition-all text-brand-dark bg-white ${
            profile
              ? "rounded-t-xl border-b-0 border-brand-yellow/50"
              : "rounded-xl border-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
          }`}
        />

        {/* Right side: loading spinner, confirm button, or checkmark */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profile ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : canLookup ? (
            <button
              type="button"
              onClick={lookupHandle}
              className="w-8 h-8 rounded-lg bg-brand-yellow hover:bg-brand-yellow/80 flex items-center justify-center transition-colors"
              title="Look up profile"
            >
              <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {error && <p className="text-sm text-brand-red mt-2">{error}</p>}

      {/* Expanded card: profile + reason */}
      {profile && (
        <div className="border-2 border-t-0 border-brand-yellow/50 rounded-b-xl bg-brand-cream/30 overflow-hidden">
          <ProfilePreview
            handle={profile.handle}
            name={profile.name}
            bio={profile.bio}
            profileImageUrl={profile.profileImageUrl}
            followerCount={profile.followerCount}
          />
          <div className="px-4 pb-4">
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(index, e.target.value)}
              placeholder={PROMPTS[index % PROMPTS.length]}
              rows={2}
              maxLength={280}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 outline-none transition-all resize-none placeholder:text-gray-400 text-brand-dark"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-gray-400">Optional</span>
              {reason.length > 0 && (
                <span className="text-[11px] text-gray-400">{reason.length}/280</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
