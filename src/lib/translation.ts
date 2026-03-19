// eslint-disable-next-line @typescript-eslint/no-var-requires
const translate = require('google-translate-api');

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === "en" || !text) return text;
  
  try {
    // @ts-ignore
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function translateNews(news: any[], targetLang: string): Promise<any[]> {
  if (targetLang === "en" || !news?.length) return news;
  
  const translated = await Promise.all(
    news.map(async (item) => ({
      ...item,
      title: await translateText(item.title || "", targetLang),
      summary: await translateText((item.summary || "").slice(0, 150), targetLang),
      whyItMatters: await translateText(item.whyItMatters || "", targetLang),
    }))
  );
  
  return translated;
}
