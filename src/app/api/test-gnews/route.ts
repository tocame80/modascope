import { NextResponse } from "next/server";

export async function GET() {
  const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
  
  if (!GNEWS_API_KEY) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }
  
  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=fashion&lang=en&max=3&apikey=${GNEWS_API_KEY}`
    );
    
    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      articlesCount: data.articles?.length || 0,
      totalArticles: data.totalArticles,
      firstArticle: data.articles?.[0]?.title || "none"
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
