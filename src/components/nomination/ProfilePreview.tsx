"use client";

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
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-3">
        <Image
          src={profileImageUrl}
          alt={name}
          width={56}
          height={56}
          className="rounded-full ring-2 ring-brand-yellow"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-brand-dark truncate">{name}</h3>
          <p className="text-sm text-gray-500">@{handle}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatNumber(followerCount)} followers
          </p>
        </div>
      </div>
      {bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{bio}</p>
      )}
    </div>
  );
}
