
import React, { useRef } from 'react';
import { X, ExternalLink, Globe, MapPin, ArrowLeft, Share2 } from 'lucide-react';
import { NewsItem } from '../types';
import { toBlob } from 'html-to-image';

interface NewsModalProps {
  news: NewsItem | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ news, onClose, onToast }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!news) return null;

  const handleShare = async () => {
    if (!contentRef.current) return;

    try {
      const blob = await toBlob(contentRef.current, {
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
      console.error('Failed to share modal', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        ref={contentRef}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col"
      >
        <div className="share-exclude absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-lg text-white transition-colors"
            title="分享截图"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-lg text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative h-64 sm:h-80 md:h-96">
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10">
            <div className="flex gap-3 mb-4">
               <span className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                news.category === 'Domestic' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-indigo-500 text-white shadow-lg'
              }`}>
                {news.category === 'Domestic' ? <MapPin className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {news.category === 'Domestic' ? '国内' : '国际'}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                {news.source}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {news.title}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-10 md:p-12">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-100"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">新闻摘要</span>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-6 mb-10">
                  {news.summary}
                </p>
                <div className="text-gray-600 leading-loose text-lg whitespace-pre-wrap space-y-4">
                  {news.content.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-0">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">发布信息</h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">来源平台</span>
                    <span className="font-semibold text-gray-900">{news.source}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">简报日期</span>
                    <span className="font-semibold text-gray-900">{news.timestamp}</span>
                  </div>
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="share-exclude flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200"
                  >
                    查看原文 <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="share-exclude mt-12 flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> 返回简报列表
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
