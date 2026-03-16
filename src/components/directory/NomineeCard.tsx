"use client";

import { useState } from "react";
import Image from "next/image";
import { formatNumber } from "@/lib/utils";
import { NomineeModal } from "./NomineeModal";
import type { NomineeProfile } from "@/types";

export function NomineeCard({ nominee }: { nominee: NomineeProfile }) {
  const [modalNominee, setModalNominee] = useState<NomineeProfile | null>(null);

  async function openNomineeByHandle(handle: string) {
    try {
      const res = await fetch(`/api/nominees?search=${encodeURIComponent(handle)}&limit=1`);
      const data = await res.json();
      const found = data.nominees?.find(
        (n: NomineeProfile) => n.handle.toLowerCase() === handle.toLowerCase()
      );
      if (found) {
        setModalNominee({ ...found, nominationCount: Number(found.nominationCount) });
      }
    } catch {
      // Couldn't load — stay on current modal
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalNominee(nominee)}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-yellow/50 transition-all group cursor-pointer h-full text-left w-full"
      >
        <div className="flex items-start gap-3">
          {nominee.profileImageUrl ? (
            <Image
              src={nominee.profileImageUrl}
              alt={nominee.name ?? nominee.handle}
              width={48}
              height={48}
              className="rounded-full ring-2 ring-brand-yellow/50 group-hover:ring-brand-yellow transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-dark font-bold">
              {nominee.handle[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-brand-dark truncate group-hover:text-brand-red transition-colors">
              {nominee.name ?? `@${nominee.handle}`}
            </h3>
            <p className="text-sm text-gray-500">@{nominee.handle}</p>
          </div>
          {nominee.isFeatured && (
            <span className="bg-brand-yellow/20 text-brand-dark text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        {nominee.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {nominee.bio}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          {nominee.followerCount != null && (
            <span>{formatNumber(nominee.followerCount)} followers</span>
          )}
          {nominee.nominationCount != null && nominee.nominationCount > 0 && (
            <span className="text-brand-red font-medium">
              Nominated {nominee.nominationCount}x
            </span>
          )}
        </div>
      </button>

      {modalNominee && (
        <NomineeModal
          nominee={modalNominee}
          onClose={() => setModalNominee(null)}
          onSelectNominee={openNomineeByHandle}
        />
      )}
    </>
  );
}
