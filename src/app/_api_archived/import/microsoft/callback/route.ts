import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json(
    { error: "Microsoft Outlook import not yet implemented" },
    { status: 501 }
  );
}
