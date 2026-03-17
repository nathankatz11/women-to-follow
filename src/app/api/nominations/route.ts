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
  const { handles, reasons, nominatorHandle } = body;

  if (!Array.isArray(handles) || handles.length < 1 || handles.length > 3) {
    return NextResponse.json(
      { error: "Between 1 and 3 handles are required" },
      { status: 400 }
    );
  }

  const cleanHandles = handles.map((h: string) =>
    h.replace(/^@/, "").trim().toLowerCase()
  );

  // Validate handles aren't empty
  if (cleanHandles.some((h: string) => !h)) {
    return NextResponse.json(
      { error: "All handles must be filled in" },
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

  // Build handle-to-reason map
  const cleanReasons: Record<string, string> = {};
  if (Array.isArray(reasons)) {
    cleanHandles.forEach((h: string, i: number) => {
      const r = reasons[i]?.trim();
      if (r) cleanReasons[h] = r;
    });
  }

  const nomination = await createNomination(
    cleanHandles,
    nominatorHandle?.replace(/^@/, "").trim() || undefined,
    ip,
    cleanReasons
  );

  return NextResponse.json({
    nominationId: nomination.id,
    nominees: nomineeResults,
  });
}
