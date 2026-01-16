'use client';

import { useState } from 'react';

interface DashboardFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: DashboardFilters) => void;
}

export interface DashboardFilters {
  branches: string[];
  creditOfficers: string[];
  loanStatus: string[];
  amountRange: { min: number; max: number };
}

export function DashboardFiltersModal({ isOpen, onClose, onApply }: DashboardFiltersModalProps) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedCreditOfficers, setSelectedCreditOfficers] = useState<string[]>([]);
  const [selectedLoanStatus, setSelectedLoanStatus] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(1000000);

  // Sample data - replace with actual data from API
  const branches = ['Igando Branch', 'Ikeja Branch', 'Lekki Branch', 'Victoria Island Branch'];
  const creditOfficers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'];
  const loanStatuses = ['Active', 'Scheduled', 'Completed', 'Defaulted'];

  const handleApply = () => {
    onApply({
      branches: selectedBranches,
      creditOfficers: selectedCreditOfficers,
      loanStatus: selectedLoanStatus,
      amountRange: { min: minAmount, max: maxAmount },
    });
    onClose();
  };

  const handleClearAll = () => {
    setSelectedBranches([]);
    setSelectedCreditOfficers([]);
    setSelectedLoanStatus([]);
    setMinAmount(0);
    setMaxAmount(1000000);
  };

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const activeFiltersCount = 
    selectedBranches.length + 
    selectedCreditOfficers.length + 
    selectedLoanStatus.length + 
    (minAmount > 0 || maxAmount < 1000000 ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
          <div>
            <h2 className="text-lg font-semibold text-[#101828]">Advanced Filters</h2>
            {activeFiltersCount > 0 && (
              <p className="text-sm text-[#475467] mt-1">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#667085] hover:text-[#344054] transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-3">
              Branches
            </label>
            <div className="grid grid-cols-2 gap-2">
              {branches.map((branch) => (
                <label
                  key={branch}
                  className="flex items-center gap-2 p-3 border border-[#D0D5DD] rounded-lg cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedBranches.includes(branch)}
                    onChange={() => toggleSelection(branch, selectedBranches, setSelectedBranches)}
                    className="w-4 h-4 text-[#7F56D9] border-[#D0D5DD] rounded focus:ring-[#7F56D9]"
                  />
                  <span className="text-sm text-[#344054]">{branch}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Credit Officer Selection */}
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-3">
              Credit Officers
            </label>
            <div className="grid grid-cols-2 gap-2">
              {creditOfficers.map((officer) => (
                <label
                  key={officer}
                  className="flex items-center gap-2 p-3 border border-[#D0D5DD] rounded-lg cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCreditOfficers.includes(officer)}
                    onChange={() => toggleSelection(officer, selectedCreditOfficers, setSelectedCreditOfficers)}
                    className="w-4 h-4 text-[#7F56D9] border-[#D0D5DD] rounded focus:ring-[#7F56D9]"
                  />
                  <span className="text-sm text-[#344054]">{officer}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Loan Status Selection */}
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-3">
              Loan Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {loanStatuses.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 p-3 border border-[#D0D5DD] rounded-lg cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedLoanStatus.includes(status)}
                    onChange={() => toggleSelection(status, selectedLoanStatus, setSelectedLoanStatus)}
                    className="w-4 h-4 text-[#7F56D9] border-[#D0D5DD] rounded focus:ring-[#7F56D9]"
                  />
                  <span className="text-sm text-[#344054]">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-3">
              Amount Range (NGN)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#475467] mb-2">Minimum</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-[#475467] mb-2">Maximum</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-transparent"
                  placeholder="1000000"
                />
              </div>
            </div>
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(Number(e.target.value))}
                className="w-full h-2 bg-[#F2F4F7] rounded-lg appearance-none cursor-pointer accent-[#7F56D9]"
              />
              <div className="flex justify-between text-xs text-[#475467] mt-1">
                <span>₦0</span>
                <span>₦1,000,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#EAECF0] bg-[#F9FAFB]">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-[#344054] hover:text-[#1D2939] transition-colors"
          >
            Clear all
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
