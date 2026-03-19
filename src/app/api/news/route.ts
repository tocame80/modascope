import { NextResponse } from "next/server";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!GNEWS_API_KEY) {
    const { news } = await import("../data");
    let filteredNews = [...news];
    if (brand) filteredNews = filteredNews.filter((n) => n.brand.toLowerCase() === brand.toLowerCase());
    if (category) filteredNews = filteredNews.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    const paginatedNews = filteredNews.slice(offset, offset + limit);
    return NextResponse.json({ data: paginatedNews, meta: { total: filteredNews.length, limit, offset, hasMore: offset + limit < filteredNews.length }, source: "local" });
  }

  try {
    const query = brand || category || "fashion OR luxury OR runway";
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${limit}&apikey=${GNEWS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }
    
    const gnewsData = await response.json();
    
    const articles = (gnewsData.articles || []).map((article: any, index: number) => ({
      id: String(index + 1),
      title: article.title,
      summary: article.description?.slice(0, 200) || "",
      brand: article.source?.name || "News",
      category: category || "Fashion",
      image: article.image,
      source: article.source?.name,
      publishedAt: article.publishedAt,
      url: article.url,
      whyItMatters: "Latest fashion industry news from verified sources.",
    }));

    return NextResponse.json({
      data: articles,
      meta: {
        total: gnewsData.totalArticles || articles.length,
        limit,
        offset,
        hasMore: articles.length === limit,
      },
      source: "gnews",
    });
  } catch (error) {
    console.error("GNews API error:", error);
    const { news } = await import("../data");
    return NextResponse.json({ data: news.slice(0, limit), meta: { total: news.length, limit, offset: 0, hasMore: false }, source: "fallback" });
  }
}
