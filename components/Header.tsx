
import React from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  onRefresh: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentDate, onRefresh, isLoading }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Zap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI 每日资讯简报</h1>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{currentDate}</p>
        </div>
      </div>
      
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? '正在获取...' : '更新今日资讯'}
      </button>
    </header>
  );
};

export default Header;
