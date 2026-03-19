// eslint-disable-next-line @typescript-eslint/no-var-requires
const translate = require('google-translate-api');

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === "en" || !text) return text;
  
  try {
    // @ts-ignore
    const result = await translate(text, { to: targetLang });
    console.log("Translated:", text.substring(0, 30), "->", result.text.substring(0, 30));
    return result.text;
  } catch (error) {
    console.error("Translation error for text:", text.substring(0, 50), "Error:", error);
    return text;
  }
}

export async function translateNews(news: any[], targetLang: string): Promise<any[]> {
  if (targetLang === "en" || !news?.length) {
    console.log("No translation needed - lang:", targetLang, "news count:", news?.length);
    return news;
  }
  
  console.log("Translating", news.length, "articles to", targetLang);
  
  const translated = await Promise.all(
    news.map(async (item) => {
      try {
        const title = await translateText(item.title || "", targetLang);
        const summary = await translateText((item.summary || "").slice(0, 200), targetLang);
        const whyItMatters = await translateText(item.whyItMatters || "", targetLang);
        
        return {
          ...item,
          title,
          summary,
          whyItMatters,
        };
      } catch (e) {
        console.error("Error translating item:", e);
        return item;
      }
    })
  );
  
  console.log("Translation complete for", translated.length, "articles");
  return translated;
}
