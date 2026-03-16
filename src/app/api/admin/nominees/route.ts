import { NextRequest, NextResponse } from "next/server";
import { toggleFeatured, toggleApproved, getAllNomineesForAdmin, getStats } from "@/lib/db/queries";

export async function GET() {
  const [nominees, stats] = await Promise.all([
    getAllNomineesForAdmin(),
    getStats(),
  ]);
  return NextResponse.json({ nominees, stats });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, isFeatured, isApproved } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (typeof isFeatured === "boolean") {
    await toggleFeatured(id, isFeatured);
  }

  if (typeof isApproved === "boolean") {
    await toggleApproved(id, isApproved);
  }

  return NextResponse.json({ success: true });
}
