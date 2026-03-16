"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/utils";
import type { NomineeProfile } from "@/types";

function CarouselCard({ nominee, isActive }: { nominee: NomineeProfile; isActive: boolean }) {
  return (
    <Link
      href={`/nominee/${nominee.handle}`}
      className={`carousel-card group block flex-shrink-0 w-[280px] sm:w-[320px] transition-all duration-500 ${
        isActive ? "scale-100 opacity-100" : "scale-95 opacity-60"
      }`}
    >
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full border border-gray-100">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-brand-red via-brand-yellow to-brand-red" />

        <div className="p-6 flex flex-col items-center text-center">
          {/* Profile image */}
          <div className="relative mb-4">
            {nominee.profileImageUrl ? (
              <Image
                src={nominee.profileImageUrl}
                alt={nominee.name ?? nominee.handle}
                width={96}
                height={96}
                className="rounded-full ring-4 ring-brand-yellow/30 group-hover:ring-brand-yellow transition-all duration-300 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-yellow/40 to-brand-red/20 flex items-center justify-center text-3xl font-bold text-brand-dark">
                {nominee.handle[0]?.toUpperCase()}
              </div>
            )}
            {nominee.isFeatured && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-brand-yellow text-brand-dark text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* Name & handle */}
          <h3 className="font-bold text-lg text-brand-dark group-hover:text-brand-red transition-colors truncate max-w-full">
            {nominee.name ?? `@${nominee.handle}`}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">@{nominee.handle}</p>

          {/* Bio */}
          {nominee.bio && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {nominee.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
            {nominee.followerCount != null && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {formatNumber(nominee.followerCount)}
              </span>
            )}
            {nominee.nominationCount != null && nominee.nominationCount > 0 && (
              <span className="text-brand-red font-semibold">
                {nominee.nominationCount} nomination{nominee.nominationCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function NomineeCarousel({ nominees }: { nominees: NomineeProfile[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cardWidth = 336; // card width + gap

  const scrollTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(index, nominees.length - 1));
      setActiveIndex(clamped);
      el.scrollTo({ left: clamped * cardWidth, behavior: "smooth" });
    },
    [nominees.length, cardWidth]
  );

  const next = useCallback(() => {
    scrollTo(activeIndex >= nominees.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, nominees.length, scrollTo]);

  const prev = useCallback(() => {
    scrollTo(activeIndex <= 0 ? nominees.length - 1 : activeIndex - 1);
  }, [activeIndex, nominees.length, scrollTo]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || nominees.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isPaused, next, nominees.length]);

  // Sync scroll position to activeIndex on manual scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const idx = Math.round(el.scrollLeft / cardWidth);
          setActiveIndex(Math.max(0, Math.min(idx, nominees.length - 1)));
          ticking = false;
        });
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [nominees.length, cardWidth]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  if (nominees.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-[calc(50vw-160px)] sm:px-[calc(50vw-176px)] py-4 no-scrollbar"
      >
        {nominees.map((nominee, i) => (
          <div key={nominee.id} className="snap-center">
            <CarouselCard nominee={nominee} isActive={i === activeIndex} />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {nominees.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous nominee"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all text-brand-dark cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next nominee"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all text-brand-dark cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {nominees.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {nominees.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to nominee ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? "w-6 h-2 bg-brand-red"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
