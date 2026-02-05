
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import SearchBar from './components/SearchBar';
import NewsCard from './components/NewsCard';
import NewsModal from './components/NewsModal';
import Toast from './components/Toast';
import { fetchDailyAINews, searchAINews } from './services/geminiService';
import { NewsItem, DailyBrief, CacheStore } from './types';
import { Loader2, Calendar as CalendarIcon, Info, RefreshCw, ArrowLeft, Search as SearchIcon } from 'lucide-react';

const CACHE_KEY = 'ai_news_brief_cache';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [cache, setCache] = useState<CacheStore>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search specific states
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<NewsItem[]>([]);

  useEffect(() => {
    const savedCache = localStorage.getItem(CACHE_KEY);
    if (savedCache) {
      try {
        setCache(JSON.parse(savedCache));
      } catch (e) {
        console.error("加载缓存失败", e);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(cache).length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  }, [cache]);

  const loadBrief = useCallback(async (date: string, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    setSearchMode(false);
    
    if (!forceRefresh && cache[date]) {
      setNews(cache[date].news);
      setIsLoading(false);
      return;
    }

    try {
      const newsItems = await fetchDailyAINews(date);
      setCache(prev => ({
        ...prev,
        [date]: {
          date,
          news: newsItems,
          retrievedAt: Date.now()
        }
      }));
      setNews(newsItems);
    } catch (err) {
      setError("无法获取最新 AI 动态。请检查网络或 API 密钥配置。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [cache]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);
    setSearchMode(true);
    
    try {
      const results = await searchAINews(query);
      setSearchResults(results);
    } catch (err) {
      setError(`搜索 "${query}" 相关资讯时出错，请重试。`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const exitSearch = () => {
    setSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  useEffect(() => {
    if (!searchMode) {
      loadBrief(selectedDate);
    }
  }, [selectedDate, searchMode, loadBrief]);

  const availableDates = Object.keys(cache);
  const todayStr = new Date().toISOString().split('T')[0];
  const calendarDates = [...new Set([...availableDates, todayStr])];

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header 
        currentDate={searchMode ? `搜索: ${searchQuery}` : selectedDate} 
        onRefresh={() => searchMode ? handleSearch(searchQuery) : loadBrief(selectedDate, true)}
        isLoading={isLoading} 
      />

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="flex flex-col xl:flex-row gap-10">
          
          {/* Sidebar */}
          <aside className="xl:w-80 flex-shrink-0 space-y-6">
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={isLoading && searchMode} 
            />

            <Calendar 
              selectedDate={selectedDate}
              availableDates={calendarDates}
              onDateChange={(date) => {
                setSelectedDate(date);
                setSearchMode(false);
              }}
            />
            
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-indigo-500/50 p-1 rounded-md">
                  <Info className="w-5 h-5 text-indigo-100" />
                </div>
                <h4 className="font-bold text-sm">关于本站</h4>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                本每日简报利用 Gemini 的实时研究能力，综合 X、全球资讯及国内技术博客内容进行智能汇总。
              </p>
              <div className="flex items-center gap-4 border-t border-indigo-500 pt-4">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold">{availableDates.length}</div>
                  <div className="text-[10px] uppercase font-bold text-indigo-200">已存天数</div>
                </div>
                <div className="w-px h-8 bg-indigo-500"></div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold">{(Object.values(cache) as DailyBrief[]).reduce((acc, curr) => acc + curr.news.length, 0)}</div>
                  <div className="text-[10px] uppercase font-bold text-indigo-200">资讯总数</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
                <h2 className="text-xl font-medium text-gray-600 mb-2">
                  {searchMode ? `正在深度检索 "${searchQuery}" 相关内容...` : '正在深度扫描 AI 领域进展...'}
                </h2>
                <p className="text-sm">正在检索 X 平台及全球各大技术门户的实时数据。</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Info className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">操作中断</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">{error}</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => searchMode ? handleSearch(searchQuery) : loadBrief(selectedDate, true)}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                  >
                    重试一次
                  </button>
                  {searchMode && (
                    <button 
                      onClick={exitSearch}
                      className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                      返回每日简报
                    </button>
                  )}
                </div>
              </div>
            ) : (searchMode ? searchResults : news).length > 0 ? (
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-4">
                    {searchMode && (
                      <button 
                        onClick={exitSearch}
                        className="p-2 bg-white border border-gray-100 rounded-full hover:bg-gray-50 transition-all text-gray-500"
                        title="返回每日简报"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {searchMode ? (
                        <><SearchIcon className="w-6 h-6 text-indigo-600" /> "{searchQuery}" 相关搜索结果</>
                      ) : (
                        <><CalendarIcon className="w-6 h-6 text-indigo-600" /> 今日精选动态</>
                      )}
                    </h2>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {(searchMode ? searchResults : news).filter(n => n.category === 'International').length} 国际动态
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      {(searchMode ? searchResults : news).filter(n => n.category === 'Domestic').length} 国内动态
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(searchMode ? searchResults : news).map((item) => (
                    <NewsCard 
                      key={item.id} 
                      news={item} 
                      onClick={setSelectedNews}
                      onToast={showToast}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
                <h2 className="text-xl font-medium text-gray-600">未找到相关数据</h2>
                <p className="text-sm">尝试更换关键词，或者点击左上角箭头返回每日简报。</p>
                {searchMode && (
                  <button 
                    onClick={exitSearch}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    返回每日简报
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <NewsModal 
        news={selectedNews} 
        onClose={() => setSelectedNews(null)}
        onToast={showToast}
      />

      <div className="fixed bottom-8 right-8 z-40">
        <button 
           onClick={() => searchMode ? handleSearch(searchQuery) : loadBrief(selectedDate, true)}
           className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
           title={searchMode ? "重新搜索" : "刷新当前页面"}
        >
          <RefreshCw className={`w-6 h-6 group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
};

export default App;
