'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from './Checkbox';

interface Report {
  id: string;
  reportId: string;
  creditOfficer: string;
  creditOfficerId: string;
  branch: string;
  branchId: string;
  email: string;
  dateSent: string;
  timeSent: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  status: 'submitted' | 'pending' | 'approved' | 'declined';
  isApproved?: boolean;
  loansDispursed: number;
  loansValueDispursed: string;
  savingsCollected: string;
  repaymentsCollected: number;
  createdAt: string;
  updatedAt: string;
  isMissed?: boolean;
}

interface ReportsTableProps {
  reports: Report[];
  selectedReports: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReportClick?: (report: Report) => void;
}

export default function ReportsTable({ reports, selectedReports, onSelectionChange, onEdit, onDelete, onReportClick }: ReportsTableProps) {
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectionChange(reports.map(report => report.id));
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

  const handleEdit = (id: string) => {
    console.log('Edit Report:', id);
    onEdit?.(id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete Report:', id);
    onDelete?.(id);
  };

  const allSelected = reports.length > 0 && selectedReports.length === reports.length;

  return (
    <div
      className="w-full bg-white rounded-lg overflow-hidden"
      style={{
        border: '1px solid #E5E7EB'
      }}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '800px' }}>
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {/* Checkbox + Report ID Column */}
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all reports"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Report Id
                  </span>
                </div>
              </th>

              {/* Credit Officer Column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Credit Officer
              </th>

              {/* Time Sent Column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Time sent
              </th>

              {/* Date Column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Date
              </th>

              {/* Actions Column */}
              <th className="px-6 py-3"></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onReportClick?.(report)}
              >
                {/* Report ID Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={(checked) => handleSelectOne(report.id, checked)}
                      aria-label={`Select report ${report.reportId}`}
                    />
                    <span className="text-sm text-gray-600">
                      {report.reportId}
                    </span>
                  </div>
                </td>

                {/* Credit Officer Cell */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {report.creditOfficer}
                </td>

                {/* Time Sent Cell */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {report.timeSent}
                </td>

                {/* Date Cell */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {report.dateSent}
                </td>

                {/* Actions Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {/* Edit Button - Only show if onEdit is provided */}
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(report.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Edit report ${report.reportId}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M14.1667 2.49993C14.3856 2.28106 14.6454 2.10744 14.9314 1.98899C15.2173 1.87054 15.5238 1.80957 15.8334 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5 2.49993C17.7189 2.7188 17.8925 2.97863 18.011 3.2646C18.1294 3.55057 18.1904 3.85706 18.1904 4.16659C18.1904 4.47612 18.1294 4.78262 18.011 5.06859C17.8925 5.35455 17.7189 5.61439 17.5 5.83326L6.25002 17.0833L1.66669 18.3333L2.91669 13.7499L14.1667 2.49993Z"
                            stroke="#6B7280"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Delete Button - Only show if onDelete is provided */}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(report.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Delete report ${report.reportId}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M13.3333 5V4.33333C13.3333 3.39991 13.3333 2.9332 13.1517 2.57668C12.9919 2.26308 12.7369 2.00811 12.4233 1.84832C12.0668 1.66667 11.6001 1.66667 10.6667 1.66667H9.33333C8.39991 1.66667 7.9332 1.66667 7.57668 1.84832C7.26308 2.00811 7.00811 2.26308 6.84832 2.57668C6.66667 2.9332 6.66667 3.39991 6.66667 4.33333V5M8.33333 9.58333V13.75M11.6667 9.58333V13.75M2.5 5H17.5M15.8333 5V14.3333C15.8333 15.7335 15.8333 16.4335 15.5608 16.9683C15.3212 17.4387 14.9387 17.8212 14.4683 18.0608C13.9335 18.3333 13.2335 18.3333 11.8333 18.3333H8.16667C6.76654 18.3333 6.06647 18.3333 5.53169 18.0608C5.06129 17.8212 4.67883 17.4387 4.43915 16.9683C4.16667 16.4335 4.16667 15.7335 4.16667 14.3333V5"
                            stroke="#6B7280"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Show a placeholder if no actions are available */}
                    {!onEdit && !onDelete && (
                      <div className="w-20 h-8"></div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
