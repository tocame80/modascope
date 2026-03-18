import { NextResponse } from "next/server";
import { sources } from "../data";

export async function GET() {
  return NextResponse.json({
    data: sources,
    meta: {
      total: sources.length,
    },
  });
}
