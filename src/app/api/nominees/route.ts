import { NextRequest, NextResponse } from "next/server";
import { getNomineesWithCounts, getStats } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") ?? undefined;
  const sort = (searchParams.get("sort") as "nominations" | "recent" | "featured") ?? "nominations";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24", 10), 100);
  const featuredOnly = searchParams.get("featured") === "true";

  const nominees = await getNomineesWithCounts({
    search,
    sort,
    page,
    limit,
    featuredOnly,
  });

  const stats = await getStats();

  return NextResponse.json({ nominees, stats, page, limit });
}
