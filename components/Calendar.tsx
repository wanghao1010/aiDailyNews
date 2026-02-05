
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  availableDates: string[];
  onDateChange: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, availableDates, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysCount = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);
  
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">{year}年 {monthNames[month]}</h3>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`offset-${i}`} className="h-10" />
        ))}
        {Array.from({ length: daysCount }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isAvailable = availableDates.includes(dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <button
              key={dateStr}
              disabled={!isAvailable}
              onClick={() => onDateChange(dateStr)}
              className={`
                h-10 w-full rounded-lg text-sm font-medium transition-all relative flex items-center justify-center
                ${isSelected ? 'bg-indigo-600 text-white shadow-md' : ''}
                ${!isSelected && isAvailable ? 'hover:bg-indigo-50 text-indigo-700 bg-indigo-50/30' : ''}
                ${!isAvailable ? 'text-gray-300 cursor-not-allowed opacity-40' : ''}
              `}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
