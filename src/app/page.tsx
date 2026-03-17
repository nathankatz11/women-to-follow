import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getNomineesWithCounts, getStats } from "@/lib/db/queries";
import { NomineeCarousel } from "@/components/home/NomineeCarousel";
import { NominationForm } from "@/components/nomination/NominationForm";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import type { NomineeProfile } from "@/types";

export const revalidate = 60;

export default async function Home() {
  let stats = { totalNominees: 0, totalNominations: 0 };
  let carouselNominees: NomineeProfile[] = [];
  let directoryNominees: NomineeProfile[] = [];

  try {
    const [fetchedStats, carouselRows, directoryRows] = await Promise.all([
      getStats(),
      getNomineesWithCounts({ sort: "nominations", limit: 20 }),
      getNomineesWithCounts({ sort: "recent", page: 1, limit: 24 }),
    ]);

    stats = fetchedStats;

    const mapNominee = (n: typeof carouselRows[number]): NomineeProfile => ({
      id: n.id,
      handle: n.handle,
      name: n.name,
      bio: n.bio,
      profileImageUrl: n.profileImageUrl,
      followerCount: n.followerCount,
      isFeatured: n.isFeatured,
      nominationCount: Number(n.nominationCount),
      createdAt: n.createdAt,
    });

    carouselNominees = carouselRows.map(mapNominee);
    directoryNominees = directoryRows.map(mapNominee);
  } catch {
    // DB not connected yet — render page without data
  }

  // Pick up to 8 nominees with profile images for the hero mosaic
  const heroFaces = carouselNominees
    .filter((n) => n.profileImageUrl)
    .slice(0, 8);

  return (
    <main className="min-h-screen">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-1.5 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="#WomenToFollow"
              width={52}
              height={52}
            />
            <span className="text-lg font-bold text-brand-red tracking-tight hidden sm:inline">
              #WomenToFollow
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="#directory"
              className="text-sm font-medium text-gray-600 hover:text-brand-red transition-colors"
            >
              Directory
            </a>
            <a href="#nominate">
              <Button size="sm">Nominate</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — full impact, single CTA */}
      <section className="relative overflow-hidden bg-brand-dark min-h-[85vh] flex items-center justify-center">
        {/* Background mosaic of nominee faces */}
        {heroFaces.length > 0 && (
          <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-8 opacity-15">
            {heroFaces.concat(heroFaces).map((n, i) => (
              <div key={`${n.handle}-${i}`} className="relative aspect-square overflow-hidden">
                <Image
                  src={n.profileImageUrl!}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-brand-dark/80 to-brand-dark" />

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          {/* Inline stats as social proof */}
          <p className="text-sm font-medium tracking-widest uppercase text-brand-yellow/80 mb-6">
            {stats.totalNominees > 0
              ? `12M+ reached · ${stats.totalNominees.toLocaleString()} women nominated · ${stats.totalNominations.toLocaleString()} nominations`
              : "The movement that reached 12M+ people"}
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.05]">
            Discover women{" "}
            <span className="text-brand-yellow">worth following</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-lg mx-auto">
            Nominate 3 women whose voices deserve to be heard.
          </p>

          <div className="mt-10">
            <a href="#nominate">
              <Button size="lg" className="text-lg px-10 py-6 shadow-lg shadow-brand-red/30">
                Nominate 3 Women
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Nominee Carousel */}
      {carouselNominees.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-brand-cream/30 to-brand-cream">
          <div className="max-w-6xl mx-auto px-6 mb-8">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark">
                Meet the nominees
              </h2>
              <a
                href="#directory"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-red hover:underline"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <NomineeCarousel nominees={carouselNominees} />
          <div className="sm:hidden text-center mt-6">
            <a
              href="#directory"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-red hover:underline"
            >
              View all nominees
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>
      )}

      {/* Nominate Section */}
      <section id="nominate" className="scroll-mt-16 py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-brand-dark">
              Your turn
            </h2>
            <p className="mt-3 text-gray-500">
              Enter up to 3 X handles. We do the rest.
            </p>
          </div>
          <NominationForm />
        </div>
      </section>

      {/* How it works — icon-only, minimal */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              {
                label: "Enter handles",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                ),
              },
              {
                label: "We fetch profiles",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                ),
              },
              {
                label: "Share & amplify",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                ),
              },
            ].map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-cream flex items-center justify-center text-brand-red">
                  {step.icon}
                </div>
                <span className="text-sm font-semibold text-brand-dark">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Movement — with Rose's profile */}
      <section className="py-16 bg-brand-dark">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            {/* Rose's profile */}
            <div className="flex-shrink-0 text-center">
              <Image
                src="https://pbs.twimg.com/profile_images/1461246278038339587/VcFVwIkh_400x400.jpg"
                alt="Rose Horowitz"
                width={140}
                height={140}
                className="rounded-full ring-4 ring-brand-yellow shadow-lg mx-auto"
              />
              <h3 className="text-white font-bold text-lg mt-4">Rose Horowitz</h3>
              <a
                href="https://x.com/RoseHorowitz31"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow text-sm hover:underline"
              >
                @RoseHorowitz31
              </a>
            </div>

            {/* Movement description */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                About the Movement
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                <span className="text-brand-yellow font-semibold">#WomenToFollow</span> is a
                movement to amplify women&apos;s voices on social media. Research shows men in
                journalism retweet other men 92% of the time — and of the 25 most-retweeted
                reporters, only three are women.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Founded by Pulitzer-nominated journalist Rose Horowitz, the hashtag reached
                12 million people in its first two weeks. Rose holds a Master&apos;s from Columbia
                University and her investigative work has been published in the New York Times,
                Forbes, and the LA Times — including a series that led to congressional hearings
                and legislative change.
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                She now hosts the bimonthly <span className="text-white font-medium">#WomenToFollow</span> livestream
                show, spotlighting leaders across journalism, tech, activism, and the arts.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="https://x.com/RoseHorowitz31"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Follow on X
                </a>
                <a
                  href="https://rosehorowitz31.medium.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Read on Medium
                </a>
                <a
                  href="https://www.youtube.com/channel/UCFJOaTa4ZzBWeqWktokonkg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Library — X, Medium, YouTube embeds */}
      <section className="py-16 bg-gradient-to-b from-brand-dark to-brand-dark/95">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            From the movement
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* YouTube embed */}
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/PjLwe2EY9cE"
                  title="#WomenToFollow Live"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-4">
                <p className="text-white font-semibold text-sm">#WomenToFollow Live</p>
                <p className="text-gray-400 text-xs mt-1">
                  Livestream interviews with women leaders
                </p>
                <a
                  href="https://www.youtube.com/channel/UCFJOaTa4ZzBWeqWktokonkg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-yellow text-xs hover:underline mt-2 inline-block"
                >
                  Watch all episodes
                </a>
              </div>
            </div>

            {/* X / Twitter embed */}
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-white font-semibold text-sm">Latest from X</span>
              </div>
              <a
                href="https://x.com/RoseHorowitz31"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="https://pbs.twimg.com/profile_images/1461246278038339587/VcFVwIkh_400x400.jpg"
                      alt="Rose Horowitz"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-white text-xs font-medium">Rose Horowitz</p>
                      <p className="text-gray-500 text-xs">@RoseHorowitz31</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Follow along for the latest #WomenToFollow nominations, interviews, and
                    conversations about closing the visibility gap.
                  </p>
                </div>
              </a>
              <a
                href="https://x.com/RoseHorowitz31"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
              >
                Follow @RoseHorowitz31
              </a>
            </div>

            {/* Medium articles */}
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                </svg>
                <span className="text-white font-semibold text-sm">On Medium</span>
              </div>
              <div className="space-y-3">
                <a
                  href="https://rosehorowitz31.medium.com/how-did-the-hashtag-oscarssowhite-become-a-catalyst-for-change-f7a43027e1f1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
                >
                  <p className="text-white text-sm font-medium leading-snug">
                    How Did #OscarsSoWhite Become a Catalyst for Change?
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Medium</p>
                </a>
                <a
                  href="https://medium.com/@RoseHorowitz31/key-strategies-for-women-returning-to-work-start-where-you-are-a74e7af17ac7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
                >
                  <p className="text-white text-sm font-medium leading-snug">
                    Key Strategies for Women Returning to Work
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Medium</p>
                </a>
              </div>
              <a
                href="https://rosehorowitz31.medium.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
              >
                Read all articles
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section — discovery feel */}
      <section id="directory" className="scroll-mt-16 py-16 bg-gradient-to-b from-white to-brand-cream/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Explore the directory
            </h2>
            <p className="mt-2 text-gray-500">
              {stats.totalNominees > 0
                ? `${stats.totalNominees.toLocaleString()} women and counting`
                : "Discover amazing women nominated by the community"}
            </p>
          </div>
          <DirectoryClient initialNominees={directoryNominees} initialStats={stats} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-brand-dark border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + copyright */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="#WomenToFollow"
                width={48}
                height={48}
              />
              <div>
                <p className="text-white font-semibold text-sm">#WomenToFollow</p>
                <p className="text-gray-500 text-xs">
                  &copy; {new Date().getFullYear()} Founded by{" "}
                  <a
                    href="https://x.com/RoseHorowitz31"
                    className="text-brand-yellow hover:underline"
                  >
                    Rose Horowitz
                  </a>
                </p>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              {/* X / Twitter */}
              <a
                href="https://x.com/RoseHorowitz31"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/rosehorowitz31/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/rosehorowitz/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/rose.horowitz/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/channel/UCFJOaTa4ZzBWeqWktokonkg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* Substack */}
              <a
                href="https://womentofollow.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Substack"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                </svg>
              </a>
              {/* Medium */}
              <a
                href="https://rosehorowitz31.medium.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Medium"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
