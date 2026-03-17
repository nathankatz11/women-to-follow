"use client";

import { useState } from "react";
import Image from "next/image";
import { formatNumber } from "@/lib/utils";

interface ProfilePreviewProps {
  handle: string;
  name: string;
  bio: string;
  profileImageUrl: string;
  followerCount: number;
}

export function ProfilePreview({
  handle,
  name,
  bio,
  profileImageUrl,
  followerCount,
}: ProfilePreviewProps) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const isLong = bio && bio.length > 120;

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <Image
          src={profileImageUrl}
          alt={name}
          width={48}
          height={48}
          className="rounded-full ring-2 ring-brand-yellow"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-brand-dark truncate text-sm">{name}</h3>
          <p className="text-xs text-gray-500">@{handle}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatNumber(followerCount)} followers
          </p>
        </div>
      </div>
      {bio && (
        <div className="mt-2">
          <p className={`text-xs text-gray-600 leading-relaxed ${!bioExpanded && isLong ? "line-clamp-2" : ""}`}>
            {bio}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setBioExpanded(!bioExpanded)}
              className="text-xs text-brand-red hover:underline mt-0.5 cursor-pointer"
            >
              {bioExpanded ? "Less" : "More"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
