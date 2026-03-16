import { NextRequest, NextResponse } from "next/server";
import { getNomineeWithNominators } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const result = await getNomineeWithNominators(handle);

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    nominators: result.nominators,
  });
}
