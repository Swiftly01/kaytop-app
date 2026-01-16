'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox } from './Checkbox';

interface Customer {
  id: string;
  customerId: string;
  name: string;
  status: 'Active' | 'Scheduled';
  phoneNumber: string;
  email: string;
  dateJoined: string;
}

interface CustomersTableProps {
  customers: Customer[];
  selectedCustomers: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit: (customerId: string) => void;
}

export default function CustomersTable({
  customers,
  selectedCustomers,
  onSelectionChange,
  onEdit
}: CustomersTableProps) {
  const router = useRouter();
  const [sortColumn, setSortColumn] = useState<string | null>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectionChange(customers.map(c => c.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectionChange([...selectedCustomers, id]);
    } else {
      onSelectionChange(selectedCustomers.filter(selectedId => selectedId !== id));
    }
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
  const sortedData = [...customers].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn as keyof Customer];
    const bValue = b[sortColumn as keyof Customer];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = customers.length > 0 && selectedCustomers.length === customers.length;

  return (
    <div
      className="w-full bg-white rounded-lg overflow-hidden"
      style={{
        maxWidth: '1075px',
        border: '1px solid #EAECF0'
      }}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          {/* Table Header */}
          <thead>
            <tr
              style={{
                background: '#F9FAFB',
                borderBottom: '1px solid #EAECF0',
                height: '44px'
              }}
            >
              {/* Checkbox + Name Column */}
              <th
                className="text-left"
                style={{
                  width: '253px',
                  padding: '12px 24px'
                }}
              >
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all customers"
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: '1px solid #D0D5DD',
                      background: '#FFFFFF'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#475467'
                    }}
                  >
                    Name
                  </span>
                </div>
              </th>

              {/* Status Column */}
              <th
                className="text-left"
                style={{
                  width: '139px',
                  padding: '12px 24px'
                }}
              >
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center hover:text-[#7F56D9] transition-colors cursor-pointer"
                  style={{ gap: '4px' }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#475467'
                    }}
                  >
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
                      stroke={sortColumn === 'status' ? '#7F56D9' : '#475467'}
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </th>

              {/* Phone Number Column */}
              <th
                className="text-left"
                style={{
                  width: '195px',
                  padding: '12px 24px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#475467'
                }}
              >
                Phone Number
              </th>

              {/* Email Column */}
              <th
                className="text-left"
                style={{
                  width: '205px',
                  padding: '12px 24px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#475467'
                }}
              >
                Email
              </th>

              {/* Date Joined Column */}
              <th
                className="text-left"
                style={{
                  width: '167px',
                  padding: '12px 24px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#475467'
                }}
              >
                Date Joined
              </th>

              {/* Actions Column */}
              <th
                style={{
                  width: '72px',
                  padding: '12px 16px'
                }}
              ></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {sortedData.map((customer) => {
              const isSelected = selectedCustomers.includes(customer.id);
              
              return (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{
                    background: isSelected ? '#F9F5FF' : '#FFFFFF',
                    borderBottom: '1px solid #EAECF0',
                    height: '72px'
                  }}
                >
                  {/* Name Cell */}
                  <td style={{ padding: '16px 24px' }}>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectOne(customer.id, checked)}
                        aria-label={`Select ${customer.name}`}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '1px solid #D0D5DD',
                          background: '#FFFFFF'
                        }}
                      />
                      <button
                        onClick={() => router.push(`/dashboard/system-admin/customers/${customer.id}`)}
                        className="flex flex-col text-left hover:opacity-80 transition-opacity"
                      >
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#101828'
                          }}
                        >
                          {customer.name}
                        </span>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#475467'
                          }}
                        >
                          {customer.customerId}
                        </span>
                      </button>
                    </div>
                  </td>

                  {/* Status Cell */}
                  <td style={{ padding: '16px 24px' }}>
                    <span
                      className="inline-flex items-center rounded-full"
                      style={{
                        background: customer.status === 'Active' ? '#ECFDF3' : 'rgba(255, 147, 38, 0.1)',
                        color: customer.status === 'Active' ? '#027A48' : 'rgba(204, 119, 32, 0.99)',
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '18px',
                        padding: '2px 8px 2px 6px',
                        borderRadius: '16px',
                        gap: '4px'
                      }}
                    >
                      <span
                        className="rounded-full"
                        style={{
                          width: '6px',
                          height: '6px',
                          background: customer.status === 'Active' ? '#12B76A' : '#FF9326'
                        }}
                      />
                      {customer.status}
                    </span>
                  </td>

                  {/* Phone Cell */}
                  <td
                    style={{
                      padding: '16px 24px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#475467'
                    }}
                  >
                    {customer.phoneNumber}
                  </td>

                  {/* Email Cell */}
                  <td
                    style={{
                      padding: '16px 24px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#475467'
                    }}
                  >
                    {customer.email}
                  </td>

                  {/* Date Joined Cell */}
                  <td
                    style={{
                      padding: '16px 24px',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#475467'
                    }}
                  >
                    {customer.dateJoined}
                  </td>

                  {/* Actions Cell */}
                  <td style={{ padding: '16px 16px' }}>
                    <button
                      onClick={() => onEdit(customer.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={`Edit ${customer.name}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M14.1667 2.49993C14.3856 2.28106 14.6454 2.10744 14.9314 1.98899C15.2173 1.87054 15.5238 1.80957 15.8334 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5 2.49993C17.7189 2.7188 17.8925 2.97863 18.011 3.2646C18.1294 3.55057 18.1904 3.85706 18.1904 4.16659C18.1904 4.47612 18.1294 4.78262 18.011 5.06859C17.8925 5.35455 17.7189 5.61439 17.5 5.83326L6.25002 17.0833L1.66669 18.3333L2.91669 13.7499L14.1667 2.49993Z"
                          stroke="#475467"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
