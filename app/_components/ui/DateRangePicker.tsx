'use client';

import { useState, useEffect, useRef } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, subDays, format } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  onApply?: (range: DateRange | undefined) => void;
  onClose?: () => void;
  initialRange?: DateRange;
}

type PresetType = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth';

export default function DateRangePicker({ onApply, onClose, initialRange }: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initialRange);
  const [activePreset, setActivePreset] = useState<PresetType | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getPresetRange = (preset: PresetType): DateRange => {
    const today = new Date();
    
    switch (preset) {
      case 'today':
        return { from: today, to: today };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { from: yesterday, to: yesterday };
      case 'thisWeek':
        return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) };
      case 'lastWeek':
        const lastWeek = subWeeks(today, 1);
        return { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
      case 'thisMonth':
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      default:
        return { from: today, to: today };
    }
  };

  const handlePresetClick = (preset: PresetType) => {
    const range = getPresetRange(preset);
    setSelectedRange(range);
    setActivePreset(preset);
  };

  const handleDaySelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    setActivePreset(null);
  };

  const handleApply = () => {
    onApply?.(selectedRange);
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const presets = [
    { label: 'Today', value: 'today' as PresetType },
    { label: 'Yesterday', value: 'yesterday' as PresetType },
    { label: 'This week', value: 'thisWeek' as PresetType },
    { label: 'Last week', value: 'lastWeek' as PresetType },
    { label: 'This month', value: 'thisMonth' as PresetType },
    { label: 'Last month', value: 'lastMonth' as PresetType },
  ];

  return (
    <div 
      ref={pickerRef}
      className="absolute top-full mt-2 right-0 z-50 bg-white rounded-lg shadow-lg border border-[#D0D5DD] overflow-visible w-[380px]"
    >
      <div className="flex flex-col">
        {/* Preset Buttons - Horizontal Layout */}
        <div className="flex items-center gap-2 p-3 border-b border-[#EAECF0] bg-[#F9FAFB] flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap ${
                activePreset === preset.value
                  ? 'bg-[#7F56D9] text-white font-medium'
                  : 'text-[#344054] bg-white hover:bg-[#F9FAFB] hover:text-[#7F56D9] border border-[#D0D5DD]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Calendar - Single Month with Custom Header */}
        <div className="p-4">
          {/* Custom Caption Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(prev => {
                const newDate = new Date(prev);
                newDate.setMonth(newDate.getMonth() - 1);
                return newDate;
              })}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-[#7F56D9] text-2xl font-bold"
              aria-label="Go to previous month"
            >
              ‹
            </button>
            <div className="text-lg font-semibold text-[#101828] flex-1 text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <button
              type="button"
              onClick={() => setCurrentMonth(prev => {
                const newDate = new Date(prev);
                newDate.setMonth(newDate.getMonth() + 1);
                return newDate;
              })}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-[#7F56D9] text-2xl font-bold"
              aria-label="Go to next month"
            >
              ›
            </button>
          </div>
          
          {/* Calendar */}
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleDaySelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            numberOfMonths={1}
            className="date-range-picker"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 px-4 pb-4 pt-2 border-t border-[#EAECF0]">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-semibold text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedRange?.from}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] active:bg-[#53389E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
