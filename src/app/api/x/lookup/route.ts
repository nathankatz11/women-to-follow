import { NextRequest, NextResponse } from "next/server";
import { lookupXUser, getHighResProfileImage } from "@/lib/x-api";
import { getNomineeByHandle, upsertNominee } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle");

  if (!handle) {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }

  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();

  // Check DB cache first (within 24 hours)
  const cached = await getNomineeByHandle(cleanHandle);
  if (cached?.name && cached.updatedAt) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (age < 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        handle: cached.handle,
        name: cached.name,
        bio: cached.bio,
        profileImageUrl: cached.profileImageUrl,
        followerCount: cached.followerCount,
        found: true,
        cached: true,
      });
    }
  }

  // Fetch from X API
  const profile = await lookupXUser(cleanHandle);

  if (!profile) {
    // If we had cached data, return it even if stale
    if (cached?.name) {
      return NextResponse.json({
        handle: cached.handle,
        name: cached.name,
        bio: cached.bio,
        profileImageUrl: cached.profileImageUrl,
        followerCount: cached.followerCount,
        found: true,
        cached: true,
      });
    }

    return NextResponse.json({
      handle: cleanHandle,
      found: false,
      error: "User not found or API unavailable",
    });
  }

  // Upsert to DB
  const profileImageUrl = getHighResProfileImage(profile.profile_image_url);
  await upsertNominee({
    handle: cleanHandle,
    name: profile.name,
    bio: profile.description,
    profileImageUrl,
    followerCount: profile.public_metrics.followers_count,
    xUserId: profile.id,
  });

  return NextResponse.json({
    handle: cleanHandle,
    name: profile.name,
    bio: profile.description,
    profileImageUrl,
    followerCount: profile.public_metrics.followers_count,
    found: true,
    cached: false,
  });
}
