import { NextResponse } from "next/server";

import { getMockCapitalGains } from "@/server/mock-api";

export async function GET() {
  return NextResponse.json(getMockCapitalGains());
}
