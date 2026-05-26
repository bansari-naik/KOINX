import { NextResponse } from "next/server";

import { getMockHoldings } from "@/server/mock-api";

export async function GET() {
  return NextResponse.json(getMockHoldings());
}
