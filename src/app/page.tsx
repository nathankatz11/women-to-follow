import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getNomineesWithCounts, getStats } from "@/lib/db/queries";
import { NomineeCard } from "@/components/directory/NomineeCard";
import type { NomineeProfile } from "@/types";

export const revalidate = 300;

export default async function Home() {
  let stats = { totalNominees: 0, totalNominations: 0 };
  let featured: NomineeProfile[] = [];

  try {
    [stats, featured] = await Promise.all([
      getStats(),
      getNomineesWithCounts({ sort: "featured", featuredOnly: true, limit: 6 }).then(
        (rows) =>
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-cream via-white to-brand-yellow-light">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(230,57,70,0.08),transparent_60%)]" />

        <nav className="relative flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <span className="text-xl font-bold text-brand-red">
            #WomenToFollow
          </span>
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

        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-dark leading-tight">
            Amplify{" "}
            <span className="text-brand-red">Women&apos;s Voices</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join the movement that reached{" "}
            <span className="font-semibold text-brand-dark">
              12 million people
            </span>
            . Nominate 3 women whose voices deserve to be heard. Together, we
            close the visibility gap.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/nominate">
              <Button size="lg" className="text-lg px-10">
                Nominate 3 Women
              </Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" size="lg" className="text-lg px-10">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-dark mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter 3 Handles",
                desc: "Type in the X handles of 3 women you think everyone should follow.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                ),
              },
              {
                step: "2",
                title: "We Fetch Profiles",
                desc: "We automatically pull in their bios, photos, and follower counts from X.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                ),
              },
              {
                step: "3",
                title: "Share & Amplify",
                desc: "Share your nominations on X and challenge others to do the same.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-brand-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-brand-red"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                </div>
                <div className="text-sm font-bold text-brand-red mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {(stats.totalNominees > 0 || stats.totalNominations > 0) && (
        <section className="py-16 bg-brand-dark text-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-brand-yellow">
                  12M+
                </div>
                <div className="text-sm text-gray-300 mt-1">People Reached</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-extrabold text-brand-yellow">
                  {stats.totalNominees.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  Women Nominated
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-4xl md:text-5xl font-extrabold text-brand-yellow">
                  {stats.totalNominations.toLocaleString()}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  Total Nominations
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Women */}
      {featured.length > 0 && (
        <section className="py-20 bg-brand-cream">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-dark mb-4">
              Featured Women to Follow
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Hand-picked by Rose Horowitz, these women are leading the way in
              their fields.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((nominee) => (
                <NomineeCard key={nominee.id} nominee={nominee} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/directory">
                <Button variant="outline">View Full Directory</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About / Connect */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">
            About the Movement
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            <span className="font-semibold text-brand-dark">
              #WomenToFollow
            </span>{" "}
            was founded by Pulitzer-nominated journalist{" "}
            <a
              href="https://x.com/RoseHorowitz31"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-red hover:underline font-semibold"
            >
              Rose Horowitz
            </a>{" "}
            to address the documented disparity where women receive
            significantly less amplification on social media. The movement has
            produced 34+ livestream episodes and generated over 450,000 social
            media impressions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
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
