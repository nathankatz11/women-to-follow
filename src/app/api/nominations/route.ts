import { NextRequest, NextResponse } from "next/server";
import { lookupXUsers, getHighResProfileImage } from "@/lib/x-api";
import { upsertNominee, createNomination } from "@/lib/db/queries";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { success } = rateLimit(`nominations:${ip}`, 10, 15 * 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many nominations. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { handles, nominatorHandle } = body;

  if (!Array.isArray(handles) || handles.length !== 3) {
    return NextResponse.json(
      { error: "Exactly 3 handles are required" },
      { status: 400 }
    );
  }

  const cleanHandles = handles.map((h: string) =>
    h.replace(/^@/, "").trim().toLowerCase()
  );

  // Validate handles aren't empty
  if (cleanHandles.some((h: string) => !h)) {
    return NextResponse.json(
      { error: "All 3 handles must be provided" },
      { status: 400 }
    );
  }

  // Batch fetch from X API
  const profiles = await lookupXUsers(cleanHandles);

  // Upsert each nominee
  const nomineeResults = [];
  for (const handle of cleanHandles) {
    const profile = profiles.get(handle);
    if (profile) {
      const nominee = await upsertNominee({
        handle,
        name: profile.name,
        bio: profile.description,
        profileImageUrl: getHighResProfileImage(profile.profile_image_url),
        followerCount: profile.public_metrics.followers_count,
        xUserId: profile.id,
      });
      nomineeResults.push({ ...nominee, found: true });
    } else {
      // Save handle even if we can't fetch the profile
      const nominee = await upsertNominee({ handle });
      nomineeResults.push({ ...nominee, found: false });
    }
  }

  const nomination = await createNomination(
    cleanHandles,
    nominatorHandle?.replace(/^@/, "").trim() || undefined,
    ip
  );

  return NextResponse.json({
    nominationId: nomination.id,
    nominees: nomineeResults,
  });
}
