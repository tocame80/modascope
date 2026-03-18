import { NextResponse } from "next/server";
import { news } from "../data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  let filteredNews = [...news];

  if (brand) {
    filteredNews = filteredNews.filter(
      (n) => n.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  if (category) {
    filteredNews = filteredNews.filter(
      (n) => n.category.toLowerCase() === category.toLowerCase()
    );
  }

  filteredNews.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const paginatedNews = filteredNews.slice(offset, offset + limit);

  return NextResponse.json({
    data: paginatedNews,
    meta: {
      total: filteredNews.length,
      limit,
      offset,
      hasMore: offset + limit < filteredNews.length,
    },
  });
}
