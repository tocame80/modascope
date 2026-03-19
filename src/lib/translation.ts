// eslint-disable-next-line @typescript-eslint/no-var-requires
let translate: any = null;

async function getTranslate() {
  if (!translate) {
    try {
      translate = require('google-translate-api');
    } catch (e) {
      console.error("Failed to load translate module:", e);
      return null;
    }
  }
  return translate;
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === "en" || !text) return text;
  
  try {
    const t = await getTranslate();
    if (!t) return text;
    
    // @ts-ignore
    const result = await t(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function translateNews(news: any[], targetLang: string): Promise<any[]> {
  if (targetLang === "en" || !news?.length) return news;
  
  try {
    const translated = await Promise.all(
      news.map(async (item) => ({
        ...item,
        title: await translateText(item.title || "", targetLang),
        summary: await translateText((item.summary || "").slice(0, 200), targetLang),
        whyItMatters: await translateText(item.whyItMatters || "", targetLang),
      }))
    );
    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    return news;
  }
}
