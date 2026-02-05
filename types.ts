
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  category: 'Domestic' | 'International';
  timestamp: string;
  imageUrl?: string;
}

export interface DailyBrief {
  date: string; // YYYY-MM-DD
  news: NewsItem[];
  retrievedAt: number;
}

export interface CacheStore {
  [date: string]: DailyBrief;
}
