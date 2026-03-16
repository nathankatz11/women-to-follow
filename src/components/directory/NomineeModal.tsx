"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { composeTweetUrl } from "@/lib/x-api";
import { Button } from "@/components/ui/button";
import type { NomineeProfile } from "@/types";

interface Nominator {
  handle: string | null;
  createdAt: string;
}

interface NominatorNomination {
  nomineeHandle: string;
  nomineeName: string | null;
  nomineeProfileImageUrl: string | null;
  createdAt: string;
}

interface NomineeModalProps {
  nominee: NomineeProfile;
  onClose: () => void;
  onSelectNominee?: (handle: string) => void;
}

function NominatorChip({
  nominator,
  onSelectNominee,
}: {
  nominator: Nominator;
  onSelectNominee?: (handle: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [nominations, setNominations] = useState<NominatorNomination[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadNominations() {
    if (!nominator.handle || expanded) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/nominators/${encodeURIComponent(nominator.handle)}/nominations`
      );
      const data = await res.json();
      setNominations(data.nominations ?? []);
    } catch {
      setNominations([]);
    } finally {
      setLoading(false);
      setExpanded(true);
    }
  }

  if (!nominator.handle) {
    return (
      <span className="bg-brand-cream px-3 py-1.5 rounded-full text-sm text-gray-400">
        Anonymous
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={loadNominations}
        className="bg-brand-cream hover:bg-brand-yellow/20 px-3 py-1.5 rounded-full text-sm text-brand-dark transition-colors cursor-pointer"
      >
        @{nominator.handle}
        <svg
          className={`inline-block w-3 h-3 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 ml-2 pl-3 border-l-2 border-brand-yellow/30 space-y-1.5">
          {loading ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : nominations.length === 0 ? (
            <p className="text-xs text-gray-400">No other nominations found</p>
          ) : (
            <>
              <p className="text-xs text-gray-500 font-medium mb-1">
                Also nominated:
              </p>
              {nominations.map((n) => (
                <button
                  key={n.nomineeHandle}
                  type="button"
                  onClick={() => onSelectNominee?.(n.nomineeHandle)}
                  className="flex items-center gap-2 text-sm text-brand-dark hover:text-brand-red transition-colors cursor-pointer w-full text-left"
                >
                  {n.nomineeProfileImageUrl ? (
                    <Image
                      src={n.nomineeProfileImageUrl}
                      alt={n.nomineeName ?? n.nomineeHandle}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                      {n.nomineeHandle[0]?.toUpperCase()}
                    </span>
                  )}
                  <span>{n.nomineeName ?? `@${n.nomineeHandle}`}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-brand-red via-brand-yellow to-brand-red rounded-t-3xl" />

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

            {nominee.bio && (
              <p className="text-gray-600 mt-4 leading-relaxed max-w-md">
                {nominee.bio}
              </p>
            )}

            {nominee.isFeatured && (
              <span className="mt-4 bg-brand-yellow/20 text-brand-dark text-sm font-medium px-4 py-1.5 rounded-full">
                Featured Woman to Follow
              </span>
            )}
          </div>

          {/* Nominated by section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Nominated by {nominators.length > 0 && `(${nominators.length})`}
            </h3>
            {loadingNominators ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : nominators.length === 0 ? (
              <p className="text-sm text-gray-400">No nominators found</p>
            ) : (
              <div className="space-y-2">
                {nominators.map((n, i) => (
                  <NominatorChip
                    key={i}
                    nominator={n}
                    onSelectNominee={onSelectNominee}
                  />
                ))}
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
