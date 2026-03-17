"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { formatNumber } from "@/lib/utils";

interface ProfileData {
  handle: string;
  name: string;
  bio: string;
  profileImageUrl: string;
  followerCount: number;
  found: boolean;
}

// Simple in-memory cache to avoid re-fetching during the same session
const profileCache = new Map<string, ProfileData | null>();

export function ProfileHoverCard({
  handle,
  children,
}: {
  handle: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, above: false });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (profileCache.has(handle)) {
      setProfile(profileCache.get(handle) ?? null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/x/lookup?handle=${encodeURIComponent(handle)}&preview=true`);
      const data = await res.json();
      if (data.found) {
        profileCache.set(handle, data);
        setProfile(data);
      } else {
        profileCache.set(handle, null);
        setProfile(null);
      }
    } catch {
      profileCache.set(handle, null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [handle]);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Calculate position relative to viewport
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const above = spaceBelow < 240;

        setCoords({
          top: above ? rect.top + window.scrollY : rect.bottom + window.scrollY + 8,
          left: rect.left + rect.width / 2,
          above,
        });
      }

      setVisible(true);

      if (!profileCache.has(handle) && !loading) {
        fetchProfile();
      } else if (profileCache.has(handle)) {
        setProfile(profileCache.get(handle) ?? null);
      }
    }, 400);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const card = visible && mounted
    ? createPortal(
        <div
          ref={cardRef}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={hide}
          style={{
            position: "absolute",
            top: coords.above ? undefined : coords.top,
            bottom: coords.above ? `${window.innerHeight - coords.top + 8}px` : undefined,
            left: coords.left,
            transform: "translateX(-50%)",
          }}
          className="z-[100] w-72 pointer-events-auto"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400 mt-2">Loading profile...</p>
              </div>
            ) : profile ? (
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {profile.profileImageUrl ? (
                    <Image
                      src={profile.profileImageUrl}
                      alt={profile.name}
                      width={48}
                      height={48}
                      className="rounded-full ring-2 ring-brand-yellow/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-dark font-bold">
                      {handle[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-dark text-sm truncate">
                      {profile.name}
                    </p>
                    <a
                      href={`https://x.com/${profile.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-red hover:underline"
                    >
                      @{profile.handle}
                    </a>
                    {profile.followerCount != null && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatNumber(profile.followerCount)} followers
                      </p>
                    )}
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                <a
                  href={`https://x.com/${profile.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-brand-dark text-white text-xs font-medium hover:bg-black transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  View on X
                </a>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm font-medium text-brand-dark">@{handle}</p>
                <a
                  href={`https://x.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-red hover:underline mt-1 inline-block"
                >
                  View on X
                </a>
              </div>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </span>
      {card}
    </>
  );
}
