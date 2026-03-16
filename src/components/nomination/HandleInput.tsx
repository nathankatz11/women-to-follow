"use client";

import { useState, useCallback } from "react";
import { ProfilePreview } from "./ProfilePreview";
import type { XLookupResult } from "@/types";

interface HandleInputProps {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onProfileLoaded: (index: number, profile: XLookupResult | null) => void;
}

export function HandleInput({
  index,
  value,
  onChange,
  onProfileLoaded,
}: HandleInputProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<XLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookupHandle = useCallback(
    async (handle: string) => {
      if (!handle || handle.length < 2) {
        setProfile(null);
        setError(null);
        onProfileLoaded(index, null);
        return;
      }

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
    [index, onProfileLoaded]
  );

  const triggerLookup = () => {
    const clean = value.replace(/^@/, "").trim();
    if (clean.length >= 2) {
      lookupHandle(clean);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Woman #{index + 1}
      </label>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            @
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(index, e.target.value.replace(/^@/, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                triggerLookup();
              }
            }}
            placeholder="handle"
            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 outline-none transition-all text-brand-dark bg-white"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={triggerLookup}
          disabled={loading || value.replace(/^@/, "").trim().length < 2}
          className="px-4 py-3 rounded-xl bg-brand-yellow text-brand-dark font-medium text-sm hover:bg-brand-yellow/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Look up
        </button>
      </div>
      {error && <p className="text-sm text-brand-red">{error}</p>}
      {profile && (
        <ProfilePreview
          handle={profile.handle}
          name={profile.name}
          bio={profile.bio}
          profileImageUrl={profile.profileImageUrl}
          followerCount={profile.followerCount}
        />
      )}
    </div>
  );
}
