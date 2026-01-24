'use client';

import { useState, useEffect, useRef } from 'react';
import { CalendarIcon } from '../icons/calendar-icon';
import { FilterIcon } from '../icons/filter-icon';
import DateRangePicker from './DateRangePicker';
import { DateRange } from 'react-day-picker';

export type TimePeriod = 'last_24_hours' | 'last_7_days' | 'last_30_days' | 'custom' | null;

interface FilterControlsProps {
  selectedPeriod?: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onFilter?: () => void;
  additionalButtons?: React.ReactNode;
}

export default function FilterControls({
  selectedPeriod = null,
  onPeriodChange,
  onDateRangeChange,
  onFilter,
  additionalButtons,
}: FilterControlsProps) {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>(selectedPeriod);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const periodGroupRef = useRef<HTMLDivElement>(null);

  // Handle click outside to deselect period
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodGroupRef.current && !periodGroupRef.current.contains(event.target as Node)) {
        if (activePeriod !== null) {
          setActivePeriod(null);
          onPeriodChange?.(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePeriod, onPeriodChange]);

  const handlePeriodClick = (period: TimePeriod) => {
    // Toggle: if clicking the same period, deselect it
    if (activePeriod === period) {
      setActivePeriod(null);
      onPeriodChange?.(null);
    } else {
      setActivePeriod(period);
      onPeriodChange?.(period);
    }
  };

  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleDateRangeApply = (range: DateRange | undefined) => {
    console.log('Applied date range:', range);
    setSelectedDateRange(range);
    setShowDatePicker(false);
    // Pass the date range to parent component to filter all dashboard data
    onDateRangeChange?.(range);
  };

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'last_24_hours', label: '24 hours' },
    { value: 'last_7_days', label: '7 days' },
    { value: 'last_30_days', label: '30 days' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full max-w-[1091px]">
      {/* Time Period Button Group */}
      <div 
        ref={periodGroupRef}
        className="inline-flex items-center border border-[#D0D5DD] rounded-lg bg-white overflow-x-auto"
        style={{
          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
        }}
      >
        {periods.map((period, index) => (
          <button
            key={period.value}
            onClick={() => handlePeriodClick(period.value)}
            className={`
              relative px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap
              focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 focus:z-10
              ${activePeriod === period.value 
                ? 'text-[#7F56D9]' 
                : 'text-[#344054] hover:text-[#7F56D9]'
              }
              ${index === 0 ? 'rounded-l-lg' : ''}
              ${index === periods.length - 1 ? 'rounded-r-lg' : ''}
              ${index !== periods.length - 1 && activePeriod !== period.value ? 'border-r border-[#D0D5DD]' : ''}
            `}
            style={{
              padding: '10px 12px',
              gap: '8px',
              ...(activePeriod === period.value && {
                boxShadow: 'inset 0 0 0 2px #7F56D9',
              }),
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Date Picker and Filter Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 relative">
        {/* Select Dates Button */}
        <button
          onClick={handleDatePickerToggle}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-xs sm:text-sm font-semibold text-[#667085] hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 flex-1 sm:flex-initial justify-center focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
          }}
          aria-label="Select date range"
          aria-expanded={showDatePicker}
        >
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" color="#667085" />
          <span className="hidden sm:inline">Select dates</span>
          <span className="sm:hidden">Dates</span>
        </button>

        {/* Date Range Picker Dropdown */}
        {showDatePicker && (
          <DateRangePicker
            onApply={handleDateRangeApply}
            onClose={() => setShowDatePicker(false)}
            initialRange={selectedDateRange}
          />
        )}

        {/* Filters Button */}
        <button
          onClick={onFilter}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-xs sm:text-sm font-semibold text-[#344054] hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 flex-1 sm:flex-initial justify-center focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
          }}
          aria-label="Open advanced filters"
        >
          <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5" color="#344054" />
          Filters
        </button>

        {/* Additional Buttons */}
        {additionalButtons}
      </div>
    </div>
  );
}
