'use client';

import { useState, useEffect } from 'react';

export interface AdvancedFilters {
  region: string;
  coCountMin: string;
  coCountMax: string;
  customerCountMin: string;
  customerCountMax: string;
  dateFrom: string;
  dateTo: string;
}

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedFilters) => void;
  currentFilters: AdvancedFilters;
}

const regions = [
  'All Regions',
  'Lagos State',
  'Osun State',
  'Oyo State',
  'Ogun State',
  'Ondo State',
  'Ekiti State',
];

export default function AdvancedFiltersModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: AdvancedFilters = {
      region: '',
      coCountMin: '',
      coCountMax: '',
      customerCountMin: '',
      customerCountMax: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(emptyFilters);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-[12px] w-[688px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow:
            '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-[#EAECF0]">
          <div className="pr-10">
            <h2 className="text-[18px] font-semibold leading-[28px] text-[#101828] mb-1">
              Advanced Filters
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Filter branches by region, CO count, customer count, and date range.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#667085"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 pt-5 pb-8 space-y-5">
          {/* Region Filter */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Region
            </label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
            >
              {regions.map((region) => (
                <option key={region} value={region === 'All Regions' ? '' : region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* CO Count Range */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Credit Officers Count
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={filters.coCountMin}
                onChange={(e) => setFilters({ ...filters, coCountMin: e.target.value })}
                placeholder="Min"
                min="0"
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
              <span className="text-[#667085]">to</span>
              <input
                type="number"
                value={filters.coCountMax}
                onChange={(e) => setFilters({ ...filters, coCountMax: e.target.value })}
                placeholder="Max"
                min="0"
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
            </div>
          </div>

          {/* Customer Count Range */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Customer Count
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={filters.customerCountMin}
                onChange={(e) =>
                  setFilters({ ...filters, customerCountMin: e.target.value })
                }
                placeholder="Min"
                min="0"
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
              <span className="text-[#667085]">to</span>
              <input
                type="number"
                value={filters.customerCountMax}
                onChange={(e) =>
                  setFilters({ ...filters, customerCountMax: e.target.value })
                }
                placeholder="Max"
                min="0"
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Date Created Range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
              <span className="text-[#667085]">to</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
            </div>
          </div>

          {/* Active Filters Count */}
          {activeFilterCount > 0 && (
            <div className="pt-2">
              <p className="text-sm text-[#475467]">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-[#EAECF0]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] border border-[#7F56D9] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
