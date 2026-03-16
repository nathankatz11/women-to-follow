import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleFeatured, toggleApproved } from "@/lib/db/queries";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
