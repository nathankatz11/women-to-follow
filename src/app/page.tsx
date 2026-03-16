import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getNomineesWithCounts, getStats } from "@/lib/db/queries";
import { NomineeCarousel } from "@/components/home/NomineeCarousel";
import type { NomineeProfile } from "@/types";

export const revalidate = 300;

export default async function Home() {
  let stats = { totalNominees: 0, totalNominations: 0 };
  let nominees: NomineeProfile[] = [];

  try {
    [stats, nominees] = await Promise.all([
      getStats(),
      getNomineesWithCounts({ sort: "nominations", limit: 20 }).then((rows) =>
        rows.map((n) => ({
          id: n.id,
          handle: n.handle,
          name: n.name,
          bio: n.bio,
          profileImageUrl: n.profileImageUrl,
          followerCount: n.followerCount,
          isFeatured: n.isFeatured,
          nominationCount: Number(n.nominationCount),
          createdAt: n.createdAt,
        }))
      ),
    ]);
  } catch {
    // DB not connected yet — render page without data
  }

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="relative flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold text-brand-red tracking-tight">
          #WomenToFollow
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/directory"
            className="text-sm font-medium text-gray-600 hover:text-brand-red transition-colors"
          >
            Directory
          </Link>
          <Link href="/nominate">
            <Button size="sm">Nominate</Button>
          </Link>
        </div>
      </nav>

      {/* Hero — compact & punchy */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-cream via-white to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(230,57,70,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,215,0,0.08),transparent_50%)]" />

        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-6 md:pt-20 md:pb-10 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-brand-red mb-4">
            The movement that reached 12M+ people
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-brand-dark leading-[1.1]">
            Discover women{" "}
            <span className="text-brand-red">worth following</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Nominate 3 women whose voices deserve to be heard.
            Together, we close the visibility gap.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/nominate">
              <Button size="lg" className="text-base px-8">
                Nominate 3 Women
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" size="lg" className="text-base px-8">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Nominee Carousel — the main attraction */}
      {nominees.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-brand-cream/30 to-brand-cream">
          <div className="max-w-6xl mx-auto px-6 mb-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark">
                  Meet the nominees
                </h2>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">
                  Swipe through women making an impact
                </p>
              </div>
              <Link
                href="/directory"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-red hover:underline"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <NomineeCarousel nominees={nominees} />
          <div className="sm:hidden text-center mt-6">
            <Link
              href="/directory"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-red hover:underline"
            >
              View all nominees
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Inline stats */}
      {(stats.totalNominees > 0 || stats.totalNominations > 0) && (
        <section className="py-14 bg-brand-dark">
          <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-10 sm:gap-16 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-yellow">12M+</div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">People Reached</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-yellow">
                {stats.totalNominees.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Women Nominated</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-yellow">
                {stats.totalNominations.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Nominations</div>
            </div>
          </div>
        </section>
      )}

      {/* How it works — streamlined */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-brand-dark mb-12">
            Three steps to amplify
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Enter 3 handles", desc: "Type the X handles of 3 women you think everyone should follow." },
              { num: "2", title: "We fetch profiles", desc: "We pull in their bios, photos, and follower counts automatically." },
              { num: "3", title: "Share & amplify", desc: "Share your nominations on X and challenge others to join in." },
            ].map((step) => (
              <div key={step.num} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-sm">
                  {step.num}
                </div>
                <div className="sm:mt-4">
                  <h3 className="font-bold text-brand-dark">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
            About the Movement
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            <span className="font-semibold text-brand-dark">#WomenToFollow</span>{" "}
            was founded by Pulitzer-nominated journalist{" "}
            <a
              href="https://x.com/RoseHorowitz31"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-red hover:underline font-semibold"
            >
              Rose Horowitz
            </a>{" "}
            to address the documented disparity where women receive significantly
            less amplification on social media.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://x.com/RoseHorowitz31"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow on X
            </a>
            <a
              href="https://medium.com/womentofollow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Read on Medium
            </a>
            <a
              href="https://www.youtube.com/@rosehorowitz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-brand-dark text-gray-400 text-sm text-center">
        <div className="max-w-6xl mx-auto px-6">
          <p>
            &copy; {new Date().getFullYear()} Women to Follow. Founded by{" "}
            <a
              href="https://x.com/RoseHorowitz31"
              className="text-brand-yellow hover:underline"
            >
              Rose Horowitz
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}
