import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getNomineeWithNominators } from "@/lib/db/queries";
import { formatNumber } from "@/lib/utils";
import { ShareToX } from "@/components/share/ShareToX";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const revalidate = 3600;

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const nominee = await getNomineeWithNominators(handle);

  if (!nominee || nominee.isApproved === false) {
    return { title: "Not Found | Women to Follow" };
  }

  return {
    title: `${nominee.name ?? `@${nominee.handle}`} | Women to Follow`,
    description:
      nominee.bio ??
      `${nominee.name ?? `@${nominee.handle}`} was nominated as a #WomenToFollow.`,
    openGraph: {
      title: `${nominee.name ?? `@${nominee.handle}`} — Women to Follow`,
      description:
        nominee.bio ??
        `Nominated as a #WomenToFollow. Discover more amazing women.`,
      images: nominee.profileImageUrl ? [nominee.profileImageUrl] : [],
    },
    twitter: {
      card: "summary",
      creator: `@${nominee.handle}`,
    },
  };
}

export default async function NomineePage({ params }: PageProps) {
  const { handle } = await params;
  const nominee = await getNomineeWithNominators(handle);

  if (!nominee || nominee.isApproved === false) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-cream to-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold text-brand-red">
          #WomenToFollow
        </Link>
        <div className="flex gap-3">
          <Link href="/directory">
            <Button variant="ghost" size="sm">
              Directory
            </Button>
          </Link>
          <Link href="/nominate">
            <Button size="sm">Nominate</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
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

            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mt-4">
              {nominee.name ?? `@${nominee.handle}`}
            </h1>

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

          {nominee.nominators.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Nominated by
              </h2>
              <div className="flex flex-wrap gap-2">
                {nominee.nominators.map((n, i) => (
                  <span
                    key={i}
                    className="bg-brand-cream px-3 py-1.5 rounded-full text-sm text-brand-dark"
                  >
                    {n.handle ? `@${n.handle}` : "Anonymous"}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <ShareToX handles={[nominee.handle]} className="flex-1" />
            <Link href="/nominate" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Include in Your Nomination
              </Button>
            </Link>
          </div>
        </div>

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: nominee.name ?? nominee.handle,
              url: `https://x.com/${nominee.handle}`,
              description: nominee.bio,
              image: nominee.profileImageUrl,
            }),
          }}
        />
      </div>
    </main>
  );
}
