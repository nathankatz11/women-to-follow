import { NextRequest, NextResponse } from "next/server";
import { getNominationsByNominator } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const nominations = await getNominationsByNominator(handle);

  return NextResponse.json({ nominations });
}
