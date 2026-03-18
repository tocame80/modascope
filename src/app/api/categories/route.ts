import { NextResponse } from "next/server";
import { categories } from "../data";

export async function GET() {
  return NextResponse.json({
    data: categories,
    meta: {
      total: categories.length,
    },
  });
}
