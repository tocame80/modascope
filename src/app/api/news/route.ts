import { NextResponse } from "next/server";
import { translateNews } from "@/lib/translation";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const brand = searchParams.get("brand");
  const category = searchParams.get("category");
  const lang = searchParams.get("lang") || "en";
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (!GNEWS_API_KEY) {
    const { news } = await import("../data");
    let filteredNews = [...news];
    if (brand) filteredNews = filteredNews.filter((n) => n.brand.toLowerCase() === brand.toLowerCase());
    if (category) filteredNews = filteredNews.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    let paginatedNews = filteredNews.slice(offset, offset + limit);
    if (lang === "ru") {
      try { paginatedNews = await translateNews(paginatedNews, "ru"); } catch (e) { console.error("Translation error:", e); }
    }
    return NextResponse.json({ data: paginatedNews, meta: { total: filteredNews.length, limit, offset, hasMore: offset + limit < filteredNews.length }, source: "local" });
  }

  try {
    const query = brand || category || "fashion";
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=30&apikey=${GNEWS_API_KEY}`
    );
    
    console.log("GNews response status:", response.status);
    const gnewsData = await response.json();
    console.log("GNews articles count:", gnewsData.articles?.length || 0);
    
    if (!gnewsData.articles || gnewsData.articles.length === 0) {
      console.log("No articles from GNews, using fallback");
      const { news } = await import("../data");
      let fallbackNews = news.slice(0, limit);
      if (lang === "ru") {
        try { fallbackNews = await translateNews(fallbackNews, "ru"); } catch (e) { console.error("Translation error:", e); }
      }
      return NextResponse.json({ data: fallbackNews, meta: { total: news.length, limit, offset: 0, hasMore: false }, source: "fallback" });
    }
    
    let articles = (gnewsData.articles || []).map((article: any, index: number) => ({
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

    // Translate if needed
    if (lang === "ru") {
      try { articles = await translateNews(articles, "ru"); } catch (e) { console.error("Translation error:", e); }
    }

    const paginatedNews = articles.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedNews,
      meta: {
        total: articles.length,
        limit,
        offset,
        hasMore: offset + limit < articles.length,
      },
      source: "gnews",
    });
  } catch (error) {
    console.error("GNews API error:", error);
    const { news } = await import("../data");
    const fallbackNews = news.slice(0, limit);
    return NextResponse.json({ data: fallbackNews, meta: { total: news.length, limit, offset: 0, hasMore: false }, source: "fallback" });
  }
}
