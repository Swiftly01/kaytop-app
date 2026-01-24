'use client';

import { useState } from 'react';
import { Checkbox } from './Checkbox';
import type { BranchReport } from '@/lib/api/types';

interface BranchAggregateTableProps {
  data: BranchReport[];
  loading: boolean;
  selectedReports: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onRowClick: (report: BranchReport) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export default function BranchAggregateTable({
  data,
  loading,
  selectedReports,
  onSelectionChange,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort
}: BranchAggregateTableProps) {
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectionChange(data.map(report => report.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectionChange([...selectedReports, id]);
    } else {
      onSelectionChange(selectedReports.filter(selectedId => selectedId !== id));
    }
  };

  const handleSort = (column: string) => {
    onSort(column);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
          <path
            d="M8 3V13M8 3L12 7M8 3L4 7"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
          <path
            d="M8 3V13M8 3L12 7M8 3L4 7"
            stroke="#374151"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1 rotate-180">
        <path
          d="M8 3V13M8 3L12 7M8 3L4 7"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const getStatusBadge = (status: BranchReport['status']) => {
    const statusConfig = {
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Approved'
      },
      declined: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Declined'
      },
      mixed: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Mixed'
      },
      pending: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Pending'
      }
    };

    const config = statusConfig[status];
    
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const allSelected = data.length > 0 && selectedReports.length === data.length;

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border border-[#E5E7EB] p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-white rounded-lg overflow-hidden"
      style={{
        border: '1px solid #E5E7EB'
      }}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '900px' }}>
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {/* Checkbox + Branch Name Column */}
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all branch reports"
                  />
                  <button
                    onClick={() => handleSort('branchName')}
                    className="flex items-center text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Branch Name
                    {getSortIcon('branchName')}
                  </button>
                </div>
              </th>

              {/* Reports Count Column */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('reportCount')}
                  className="flex items-center text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Reports
                  {getSortIcon('reportCount')}
                </button>
              </th>

              {/* Total Savings Column */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('totalSavings')}
                  className="flex items-center text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Total Savings
                  {getSortIcon('totalSavings')}
                </button>
              </th>

              {/* Total Disbursed Column */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('totalDisbursed')}
                  className="flex items-center text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Total Disbursed
                  {getSortIcon('totalDisbursed')}
                </button>
              </th>

              {/* Total Repaid Column */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('totalRepaid')}
                  className="flex items-center text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Total Repaid
                  {getSortIcon('totalRepaid')}
                </button>
              </th>

              {/* Status Column */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Status
                  {getSortIcon('status')}
                </button>
              </th>

              {/* Last Submission Column */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('lastSubmissionDate')}
                  className="flex items-center text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Last Submission
                  {getSortIcon('lastSubmissionDate')}
                </button>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.map((branchReport) => (
              <tr
                key={branchReport.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onRowClick(branchReport)}
              >
                {/* Branch Name Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedReports.includes(branchReport.id)}
                      onCheckedChange={(checked) => handleSelectOne(branchReport.id, checked)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${branchReport.branchName} reports`}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {branchReport.branchName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {branchReport.creditOfficerCount} credit officers
                      </div>
                    </div>
                  </div>
                </td>

                {/* Reports Count Cell */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {branchReport.reportCount}
                  </div>
                  <div className="text-xs text-gray-500">
                    {branchReport.pendingReports > 0 && (
                      <span className="text-yellow-600">
                        {branchReport.pendingReports} pending
                      </span>
                    )}
                    {branchReport.approvedReports > 0 && branchReport.pendingReports > 0 && (
                      <span className="text-gray-400"> • </span>
                    )}
                    {branchReport.approvedReports > 0 && (
                      <span className="text-green-600">
                        {branchReport.approvedReports} approved
                      </span>
                    )}
                  </div>
                </td>

                {/* Total Savings Cell */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(branchReport.totalSavings)}
                </td>

                {/* Total Disbursed Cell */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(branchReport.totalDisbursed)}
                </td>

                {/* Total Repaid Cell */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(branchReport.totalRepaid)}
                </td>

                {/* Status Cell */}
                <td className="px-6 py-4">
                  {getStatusBadge(branchReport.status)}
                </td>

                {/* Last Submission Cell */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(branchReport.lastSubmissionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No branch aggregates found</h3>
          <p className="text-sm text-gray-500">
            No branch aggregates match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}