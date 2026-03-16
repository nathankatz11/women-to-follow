import { db } from "@/lib/db";
import { nominees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://women-to-follow.com";

  const allNominees = await db
    .select({ handle: nominees.handle, updatedAt: nominees.updatedAt })
    .from(nominees)
    .where(eq(nominees.isApproved, true));

  const nomineePages = allNominees.map((n) => ({
    url: `${siteUrl}/nominee/${n.handle}`,
    lastModified: n.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/nominate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...nomineePages,
  ];
}
