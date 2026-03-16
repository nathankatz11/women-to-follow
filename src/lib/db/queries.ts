import { db } from ".";
import { nominees, nominations, nominationNominees } from "./schema";
import { eq, ilike, desc, sql, and, or } from "drizzle-orm";

export async function getNomineeByHandle(handle: string) {
  const result = await db
    .select()
    .from(nominees)
    .where(eq(nominees.handle, handle.toLowerCase()))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertNominee(data: {
  handle: string;
  name?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  followerCount?: number | null;
  xUserId?: string | null;
}) {
  const handle = data.handle.toLowerCase();
  const existing = await getNomineeByHandle(handle);

  if (existing) {
    const [updated] = await db
      .update(nominees)
      .set({
        name: data.name ?? existing.name,
        bio: data.bio ?? existing.bio,
        profileImageUrl: data.profileImageUrl ?? existing.profileImageUrl,
        followerCount: data.followerCount ?? existing.followerCount,
        xUserId: data.xUserId ?? existing.xUserId,
        updatedAt: new Date(),
      })
      .where(eq(nominees.handle, handle))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(nominees)
    .values({ ...data, handle })
    .returning();
  return created;
}

export async function createNomination(
  handles: string[],
  nominatorHandle?: string,
  nominatorIp?: string
) {
  const [nomination] = await db
    .insert(nominations)
    .values({ nominatorHandle, nominatorIp })
    .returning();

  for (const handle of handles) {
    const nominee = await getNomineeByHandle(handle.toLowerCase());
    if (nominee) {
      await db
        .insert(nominationNominees)
        .values({
          nominationId: nomination.id,
          nomineeId: nominee.id,
        })
        .onConflictDoNothing();
    }
  }

  return nomination;
}

export async function getNomineesWithCounts({
  search,
  sort = "nominations",
  page = 1,
  limit = 24,
  featuredOnly = false,
}: {
  search?: string;
  sort?: "nominations" | "recent" | "featured";
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
}) {
  const offset = (page - 1) * limit;

  const conditions = [eq(nominees.isApproved, true)];
  if (featuredOnly) {
    conditions.push(eq(nominees.isFeatured, true));
  }
  if (search) {
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    conditions.push(
      or(
        ilike(nominees.handle, `%${escaped}%`),
        ilike(nominees.name, `%${escaped}%`)
      )!
    );
  }

  const nominationCount = sql<number>`(
    SELECT COUNT(*) FROM nomination_nominees
    WHERE nomination_nominees.nominee_id = nominees.id
  )`.as("nomination_count");

  const orderBy =
    sort === "recent"
      ? desc(nominees.createdAt)
      : sort === "featured"
        ? desc(nominees.isFeatured)
        : desc(nominationCount);

  const results = await db
    .select({
      id: nominees.id,
      handle: nominees.handle,
      name: nominees.name,
      bio: nominees.bio,
      profileImageUrl: nominees.profileImageUrl,
      followerCount: nominees.followerCount,
      isFeatured: nominees.isFeatured,
      createdAt: nominees.createdAt,
      nominationCount,
    })
    .from(nominees)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return results;
}

export async function getAllNomineesForAdmin() {
  const nominationCount = sql<number>`(
    SELECT COUNT(*) FROM nomination_nominees
    WHERE nomination_nominees.nominee_id = nominees.id
  )`.as("nomination_count");

  return db
    .select({
      id: nominees.id,
      handle: nominees.handle,
      name: nominees.name,
      bio: nominees.bio,
      profileImageUrl: nominees.profileImageUrl,
      followerCount: nominees.followerCount,
      isFeatured: nominees.isFeatured,
      isApproved: nominees.isApproved,
      createdAt: nominees.createdAt,
      nominationCount,
    })
    .from(nominees)
    .orderBy(desc(nominationCount))
    .limit(500);
}

export async function getNomineeWithNominators(handle: string) {
  const nominee = await getNomineeByHandle(handle);
  if (!nominee) return null;

  const nominators = await db
    .select({ handle: nominations.nominatorHandle, createdAt: nominations.createdAt })
    .from(nominationNominees)
    .innerJoin(nominations, eq(nominationNominees.nominationId, nominations.id))
    .where(eq(nominationNominees.nomineeId, nominee.id))
    .orderBy(desc(nominations.createdAt));

  return { ...nominee, nominators };
}

export async function getStats() {
  const [nomineeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(nominees)
    .where(eq(nominees.isApproved, true));

  const [nominationCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(nominations);

  return {
    totalNominees: Number(nomineeCount.count),
    totalNominations: Number(nominationCount.count),
  };
}

export async function toggleFeatured(id: string, featured: boolean) {
  await db
    .update(nominees)
    .set({ isFeatured: featured, updatedAt: new Date() })
    .where(eq(nominees.id, id));
}

export async function toggleApproved(id: string, approved: boolean) {
  await db
    .update(nominees)
    .set({ isApproved: approved, updatedAt: new Date() })
    .where(eq(nominees.id, id));
}
