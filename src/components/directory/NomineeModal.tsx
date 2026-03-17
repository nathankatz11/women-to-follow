"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { composeTweetUrl } from "@/lib/x-api";
import { Button } from "@/components/ui/button";
import { ProfileHoverCard } from "./ProfileHoverCard";
import type { NomineeProfile } from "@/types";

interface Nominator {
  handle: string | null;
  createdAt: string;
  reason: string | null;
}

function ExpandableBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = bio.length > 160;

  return (
    <div className="mt-4 max-w-md">
      <p
        className={`text-gray-600 leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}
      >
        {bio}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-brand-red hover:underline mt-1 cursor-pointer"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

interface NomineeModalProps {
  nominee: NomineeProfile;
  onClose: () => void;
  onSelectNominee?: (handle: string) => void;
}

function NominatorChip({ nominator }: { nominator: Nominator }) {
  if (!nominator.handle && !nominator.reason) {
    return (
      <div className="inline-block bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-400">
        Anonymous
      </div>
    );
  }

  if (!nominator.reason) {
    // No reason — simple chip
    if (!nominator.handle) {
      return (
        <div className="inline-block bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-400">
          Anonymous
        </div>
      );
    }
    return (
      <ProfileHoverCard handle={nominator.handle}>
        <span className="inline-block bg-brand-cream hover:bg-brand-yellow/20 px-3 py-1.5 rounded-full text-sm text-brand-dark transition-colors cursor-default">
          @{nominator.handle}
        </span>
      </ProfileHoverCard>
    );
  }

  // Has a reason — show as a quote card
  return (
    <div className="bg-brand-cream/50 rounded-xl p-4 border border-brand-yellow/20">
      <p className="text-sm text-gray-700 leading-relaxed italic">
        &ldquo;{nominator.reason}&rdquo;
      </p>
      <div className="mt-2">
        {nominator.handle ? (
          <ProfileHoverCard handle={nominator.handle}>
            <span className="text-xs font-medium text-brand-dark cursor-default hover:text-brand-red transition-colors">
              — @{nominator.handle}
            </span>
          </ProfileHoverCard>
        ) : (
          <span className="text-xs text-gray-400">— Anonymous</span>
        )}
      </div>
    </div>
  );
}

export function NomineeModal({ nominee, onClose, onSelectNominee }: NomineeModalProps) {
  const [nominators, setNominators] = useState<Nominator[]>([]);
  const [loadingNominators, setLoadingNominators] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleEscape]);

  useEffect(() => {
    setLoadingNominators(true);
    setNominators([]);
    fetch(`/api/nominees/${encodeURIComponent(nominee.handle)}/nominators`)
      .then((r) => r.json())
      .then((data) => setNominators(data.nominators ?? []))
      .catch(() => setNominators([]))
      .finally(() => setLoadingNominators(false));
  }, [nominee.handle]);

  const tweetUrl = composeTweetUrl([nominee.handle]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-brand-red via-brand-yellow to-brand-red rounded-t-3xl" />

        {/* Sticky close button */}
        <div className="sticky top-0 z-10 pointer-events-none h-0">
          <button
            onClick={onClose}
            className="pointer-events-auto absolute top-3 right-4 w-8 h-8 rounded-full bg-white shadow-md hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            {nominee.profileImageUrl ? (
              <Image
                src={nominee.profileImageUrl}
                alt={nominee.name ?? nominee.handle}
                width={120}
                height={120}
                className="rounded-full ring-4 ring-brand-yellow shadow-lg"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-brand-yellow/20 flex items-center justify-center text-4xl font-bold text-brand-dark">
                {nominee.handle[0]?.toUpperCase()}
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mt-4">
              {nominee.name ?? `@${nominee.handle}`}
            </h2>

            <a
              href={`https://x.com/${nominee.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-red hover:underline mt-1"
            >
              @{nominee.handle}
            </a>

            {nominee.followerCount != null && (
              <p className="text-sm text-gray-500 mt-1">
                {formatNumber(nominee.followerCount)} followers
              </p>
            )}

            {nominee.bio && <ExpandableBio bio={nominee.bio} />}

            {nominee.isFeatured && (
              <span className="mt-4 bg-brand-yellow/20 text-brand-dark text-sm font-medium px-4 py-1.5 rounded-full">
                Featured Woman to Follow
              </span>
            )}
          </div>

          {/* Nominated by section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Nominated by {nominators.length > 0 && `(${nominators.length})`}
            </h3>
            {loadingNominators ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : nominators.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No nominators found</p>
            ) : (
              <div className="space-y-3">
                {/* Quote cards for nominators with reasons */}
                {nominators.filter((n) => n.reason).map((n, i) => (
                  <NominatorChip key={`reason-${i}`} nominator={n} />
                ))}
                {/* Inline chips for nominators without reasons */}
                {nominators.some((n) => !n.reason) && (
                  <div className="flex flex-wrap gap-2">
                    {nominators.filter((n) => !n.reason).map((n, i) => (
                      <NominatorChip key={`chip-${i}`} nominator={n} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="lg" className="gap-2 w-full">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </Button>
            </a>
            <a
              href={`https://x.com/${nominee.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="lg" className="w-full">
                Follow on X
              </Button>
            </a>
          </div>

          <div className="mt-4 text-center">
            <Link
              href={`/nominee/${nominee.handle}`}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              View full profile page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
