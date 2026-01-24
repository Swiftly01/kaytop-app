'use client';

import { useState } from 'react';
import { Checkbox } from './Checkbox';

interface CreditOfficer {
  id: string;
  name: string;
  idNumber: string;
  status: 'Active' | 'Inactive';
  phone: string;
  email: string;
  dateJoined: string;
}

interface CreditOfficersTableProps {
  data: CreditOfficer[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function CreditOfficersTable({ data, onEdit, onDelete }: CreditOfficersTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedIds(data.map(co => co.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleEdit = (id: string) => {
    console.log('Edit Credit Officer:', id);
    onEdit?.(id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete Credit Officer:', id);
    onDelete?.(id);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn as keyof CreditOfficer];
    const bValue = b[sortColumn as keyof CreditOfficer];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = data.length > 0 && selectedIds.length === data.length;

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
              {/* Checkbox + Name Column */}
              <th className="px-6 py-3 text-left">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all credit officers"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Name
                  </span>
                </div>
              </th>

              {/* Status Column */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-[#7F56D9] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Status
                  </span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    className={`transition-transform ${sortColumn === 'status' && sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke={sortColumn === 'status' ? '#7F56D9' : '#6B7280'}
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </th>

              {/* Phone Number Column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Phone Number
              </th>

              {/* Email Column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Email
              </th>

              {/* Date Joined Column */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Date Joined
              </th>

              {/* Actions Column */}
              <th className="px-6 py-3"></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {sortedData.map((officer) => (
              <tr
                key={officer.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {/* Name Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedIds.includes(officer.id)}
                      onCheckedChange={(checked) => handleSelectOne(officer.id, checked)}
                      aria-label={`Select ${officer.name}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {officer.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {officer.idNumber}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status Cell */}
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: officer.status === 'Active' ? '#ECFDF3' : '#FEF3F2',
                      color: officer.status === 'Active' ? '#027A48' : '#B42318'
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: officer.status === 'Active' ? '#12B76A' : '#F04438'
                      }}
                    />
                    {officer.status}
                  </span>
                </td>

                {/* Phone Cell */}
                <td className="px-6 py-4 text-sm text-gray-600" style={{ maxWidth: '150px' }}>
                  <div className="truncate" title={officer.phone}>
                    {officer.phone}
                  </div>
                </td>

                {/* Email Cell */}
                <td className="px-6 py-4 text-sm text-gray-600" style={{ maxWidth: '200px' }}>
                  <div className="truncate" title={officer.email}>
                    {officer.email}
                  </div>
                </td>

                {/* Date Joined Cell */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {officer.dateJoined}
                </td>

                {/* Actions Cell */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(officer.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={`Delete ${officer.name}`}
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

                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(officer.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={`Edit ${officer.name}`}
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
