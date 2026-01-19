'use client';

import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

// Branch Record Interface
export interface BranchRecord {
  id: string;
  branchId: string;
  name: string;
  cos: string;
  customers: number;
  dateCreated: string;
}

// Generic Table Props Interface
interface TableProps {
  data: any[];
  tableType: string;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: any) => void;
}

// Column Configuration Interface
interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

// Default export
export default function Table({
  data,
  tableType,
  sortColumn,
  sortDirection,
  onSort,
  onSelectionChange,
  onRowClick
}: TableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Column configurations for different table types
  const getColumnConfig = (type: string): ColumnConfig[] => {
    switch (type) {
      case 'branches':
        return [
          { key: 'branchId', label: 'Branch ID', sortable: true },
          { key: 'name', label: 'Branch Name', sortable: true },
          { key: 'cos', label: 'Credit Officers', sortable: true },
          { key: 'customers', label: 'Customers', sortable: true },
          { key: 'dateCreated', label: 'Date Created', sortable: true }
        ];
      default:
        // Default configuration for unknown table types
        return Object.keys(data[0] || {}).map(key => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          sortable: true
        }));
    }
  };

  const columns = getColumnConfig(tableType);

  // Handle row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedRows, rowId]
      : selectedRows.filter(id => id !== rowId);
    
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? data.map(row => row.id) : [];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  // Handle sort
  const handleSort = (columnKey: string) => {
    onSort?.(columnKey);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#EAECF0] p-8 text-center">
        <p className="text-[#475467]">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#EAECF0] overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#F9FAFB]">
          <tr>
            {/* Selection column */}
            {onSelectionChange && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-[#D0D5DD]"
                />
              </th>
            )}
            
            {/* Data columns */}
            {columns.map((column) => (
              <th 
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium text-[#475467] uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-[#F2F4F7]' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && sortColumn === column.key && (
                    sortDirection === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4" />
                      : <ChevronDownIcon className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-[#EAECF0]">
          {data.map((row, index) => (
            <tr 
              key={row.id || index}
              className={`hover:bg-[#F9FAFB] ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {/* Selection column */}
              {onSelectionChange && (
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRowSelect(row.id, e.target.checked);
                    }}
                    className="rounded border-[#D0D5DD]"
                  />
                </td>
              )}
              
              {/* Data columns */}
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-4 text-sm text-[#475467]">
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key] || '-'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}