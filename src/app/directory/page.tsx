import { getNomineesWithCounts, getStats } from "@/lib/db/queries";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { NomineeProfile } from "@/types";

export const metadata = {
  title: "Directory | Women to Follow",
  description:
    "Browse the full directory of women nominated by the #WomenToFollow community.",
};

export const revalidate = 60;

export default async function DirectoryPage() {
  const [nominees, stats] = await Promise.all([
    getNomineesWithCounts({ sort: "nominations", page: 1, limit: 24 }),
    getStats(),
  ]);

  const mapped: NomineeProfile[] = nominees.map((n) => ({
    id: n.id,
    handle: n.handle,
    name: n.name,
    bio: n.bio,
    profileImageUrl: n.profileImageUrl,
    followerCount: n.followerCount,
    isFeatured: n.isFeatured,
    nominationCount: Number(n.nominationCount),
    createdAt: n.createdAt,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-cream to-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold text-brand-red">
          #WomenToFollow
        </Link>
        <Link href="/nominate">
          <Button size="sm">Nominate 3 Women</Button>
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">
          Women to Follow Directory
        </h1>
        <p className="text-gray-600 mb-8">
          Discover amazing women nominated by the community.
        </p>

        <DirectoryClient initialNominees={mapped} initialStats={stats} />
      </div>
    </main>
  );
}
