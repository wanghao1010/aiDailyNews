
import React, { useRef } from 'react';
import { ExternalLink, Globe, MapPin, Share2 } from 'lucide-react';
import { NewsItem } from '../types';
import { toBlob } from 'html-to-image';

interface NewsCardProps {
  news: NewsItem;
  onClick: (news: NewsItem) => void;
  onToast: (msg: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onClick, onToast }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current) return;

    try {
      const blob = await toBlob(cardRef.current, {
        filter: (node) => {
          return !(node instanceof HTMLElement && node.classList.contains('share-exclude'));
        },
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      if (blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        onToast('截图已复制到剪贴板');
      }
    } catch (err) {
      console.error('Failed to share card', err);
    }
  };

  return (
    <div 
      ref={cardRef}
      onClick={() => onClick(news)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full relative"
    >
      {/* Share Button (Hover state) */}
      <button
        onClick={handleShare}
        className="share-exclude absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
        title="分享截图"
      >
        <Share2 className="w-4 h-4" />
      </button>

      <div className="relative h-48 overflow-hidden">
        <img 
          src={news.imageUrl} 
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          crossOrigin="anonymous"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
            news.category === 'Domestic' 
              ? 'bg-red-500/80 text-white' 
              : 'bg-indigo-500/80 text-white'
          }`}>
            {news.category === 'Domestic' ? <MapPin className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {news.category === 'Domestic' ? '国内' : '国际'}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {news.source}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {news.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {news.summary}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">{news.timestamp}</span>
          <div className="flex items-center text-indigo-600 font-semibold text-xs gap-1 group-hover:gap-2 transition-all">
            阅读全文 <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
