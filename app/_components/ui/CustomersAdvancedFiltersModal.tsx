'use client';

import { useState, useEffect } from 'react';
import { useFocusManagement, useScreenReader } from './AccessibilityUtils';

export interface CustomerAdvancedFilters {
  status: string;
  loanStatus: string;
  branch: string;
  creditOfficer: string;
  registrationDateFrom: string;
  registrationDateTo: string;
  loanAmountMin: string;
  loanAmountMax: string;
  region: string;
}

interface CustomersAdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: CustomerAdvancedFilters) => void;
  currentFilters: CustomerAdvancedFilters;
}

const customerStatuses = [
  'All Statuses',
  'Active',
  'Inactive',
  'Suspended',
  'Pending Approval'
];

const loanStatuses = [
  'All Loan Statuses',
  'Active',
  'Completed',
  'Overdue',
  'Defaulted',
  'Pending'
];

const branches = [
  'All Branches',
  'Lagos Main Branch',
  'Ibadan Branch',
  'Abeokuta Branch',
  'Osogbo Branch',
  'Akure Branch',
  'Ado-Ekiti Branch'
];

const creditOfficers = [
  'All Credit Officers',
  'John Doe',
  'Jane Smith',
  'Michael Johnson',
  'Sarah Wilson',
  'David Brown',
  'Lisa Davis'
];

const regions = [
  'All Regions',
  'Lagos State',
  'Osun State',
  'Oyo State',
  'Ogun State',
  'Ondo State',
  'Ekiti State'
];

export default function CustomersAdvancedFiltersModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: CustomersAdvancedFiltersModalProps) {
  const [filters, setFilters] = useState<CustomerAdvancedFilters>(currentFilters);
  const { trapFocus, restoreFocus } = useFocusManagement();
  const { announce, LiveRegion } = useScreenReader();

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;
    onApply(filters);
    announce(`${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: CustomerAdvancedFilters = {
      status: '',
      loanStatus: '',
      branch: '',
      creditOfficer: '',
      registrationDateFrom: '',
      registrationDateTo: '',
      loanAmountMin: '',
      loanAmountMax: '',
      region: '',
    };
    setFilters(emptyFilters);
    announce('All filters cleared');
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
              Advanced Customer Filters
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Filter customers by status, loan information, branch, and registration details.
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
          {/* Customer Status Filter */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Customer Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
            >
              {customerStatuses.map((status) => (
                <option key={status} value={status === 'All Statuses' ? '' : status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Status Filter */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Loan Status
            </label>
            <select
              value={filters.loanStatus}
              onChange={(e) => setFilters({ ...filters, loanStatus: e.target.value })}
              className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
            >
              {loanStatuses.map((status) => (
                <option key={status} value={status === 'All Loan Statuses' ? '' : status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Branch and Region Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Branch
              </label>
              <select
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch === 'All Branches' ? '' : branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Credit Officer Filter */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Credit Officer
            </label>
            <select
              value={filters.creditOfficer}
              onChange={(e) => setFilters({ ...filters, creditOfficer: e.target.value })}
              className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
            >
              {creditOfficers.map((officer) => (
                <option key={officer} value={officer === 'All Credit Officers' ? '' : officer}>
                  {officer}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Amount Range */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Loan Amount Range (₦)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={filters.loanAmountMin}
                onChange={(e) => setFilters({ ...filters, loanAmountMin: e.target.value })}
                placeholder="Min amount"
                min="0"
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
              <span className="text-[#667085]">to</span>
              <input
                type="number"
                value={filters.loanAmountMax}
                onChange={(e) => setFilters({ ...filters, loanAmountMax: e.target.value })}
                placeholder="Max amount"
                min="0"
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
            </div>
          </div>

          {/* Registration Date Range */}
          <div>
            <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
              Registration Date Range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filters.registrationDateFrom}
                onChange={(e) => setFilters({ ...filters, registrationDateFrom: e.target.value })}
                className="flex-1 px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
              <span className="text-[#667085]">to</span>
              <input
                type="date"
                value={filters.registrationDateTo}
                onChange={(e) => setFilters({ ...filters, registrationDateTo: e.target.value })}
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
              className="px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] border border-[#7F56D9] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
        
        {/* Screen reader announcements */}
        <LiveRegion />
      </div>
    </div>
  );
}