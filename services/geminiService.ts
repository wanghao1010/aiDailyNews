
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function fetchDailyAINews(date: string): Promise<NewsItem[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    搜索 ${date} 的顶级 AI 新闻。
    包括来自 X (Twitter)、OpenAI, Google, Meta 等主要平台以及国内平台（如百度、阿里、字节跳动、月之暗面 Moonshot、DeepSeek、智谱AI等）的重要进展。
    
    请提供一份精心挑选的列表，包含至少 40 个新闻项目（20 个国际，20 个国内）。
    
    必须使用简体中文返回所有内容。
    每个项目格式为 JSON 对象，包含：
    - title: 简洁有力的标题
    - summary: 1-2 句的概述
    - content: 详细分析（约 300 字），说明该新闻的影响及重要性
    - source: 原始来源名称（例如 'X - @用户名', 'TechCrunch', 'IT之家', '财联社'）
    - url: 新闻或讨论的直接链接
    - category: 'Domestic' (国内) 或 'International' (国际)
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["title", "summary", "content", "source", "url", "category"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim() || "[]";
    const newsData = JSON.parse(jsonStr) as any[];
    
    return newsData.map((item, index) => ({
      ...item,
      id: `${date}-${index}`,
      timestamp: date,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title + index)}/800/600`
    }));
  } catch (error) {
    console.error("获取 AI 新闻时出错:", error);
    throw error;
  }
}

export async function searchAINews(query: string): Promise<NewsItem[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    搜索关于 "${query}" 的最新 AI 相关资讯。
    请提供至少 12 个相关的资讯项目。
    
    必须使用简体中文返回所有内容。
    每个项目格式为 JSON 对象，包含：
    - title: 简洁有力的标题
    - summary: 1-2 句的概述
    - content: 详细分析（约 300 字），说明该新闻的影响及重要性
    - source: 原始来源名称
    - url: 直接链接
    - category: 'Domestic' (国内) 或 'International' (国际)
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["title", "summary", "content", "source", "url", "category"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim() || "[]";
    const newsData = JSON.parse(jsonStr) as any[];
    
    return newsData.map((item, index) => ({
      ...item,
      id: `search-${Date.now()}-${index}`,
      timestamp: "最近资讯",
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.title + index)}/800/600`
    }));
  } catch (error) {
    console.error("搜索 AI 新闻时出错:", error);
    throw error;
  }
}
