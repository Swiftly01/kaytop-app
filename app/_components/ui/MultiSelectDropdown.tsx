'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  name: string;
  email?: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export default function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder = 'Select users...',
  searchPlaceholder = 'Search users...',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.email && opt.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggle = (optionId: string) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId));
    } else {
      onChange([...selectedIds, optionId]);
    }
  };

  const handleRemove = (optionId: string) => {
    onChange(selectedIds.filter((id) => id !== optionId));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Selected Items Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] px-[14px] py-[8px] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] cursor-pointer hover:border-[#7F56D9] transition-all"
      >
        {selectedOptions.length === 0 ? (
          <div className="flex items-center justify-between h-[28px]">
            <span className="text-[16px] text-[#667085]">{placeholder}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#667085"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <div
                key={option.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#F4F3FF] text-[#5925DC] text-sm rounded-md"
                onClick={(e) => e.stopPropagation()}
              >
                <span>{option.name}</span>
                <button
                  onClick={() => handleRemove(option.id)}
                  className="hover:bg-[#7F56D9]/20 rounded p-0.5 transition-colors"
                  aria-label={`Remove ${option.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#667085"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-10 w-full mt-2 bg-white border border-[#D0D5DD] rounded-lg shadow-lg max-h-[300px] overflow-hidden"
          style={{
            boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-[#EAECF0]">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
                    stroke="#667085"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#D0D5DD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#667085] text-center">
                No users found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggle(option.id)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#7F56D9] border-[#7F56D9]'
                          : 'border-[#D0D5DD] bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#101828]">
                        {option.name}
                      </div>
                      {option.email && (
                        <div className="text-xs text-[#667085]">{option.email}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selectedIds.length > 0 && (
            <div className="p-2 border-t border-[#EAECF0] flex items-center justify-between">
              <span className="text-sm text-[#667085]">
                {selectedIds.length} selected
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="text-sm text-[#7F56D9] hover:text-[#6941C6] font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
