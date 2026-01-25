'use client';

import { useState } from 'react';
import { Checkbox } from './Checkbox';

interface Loan {
  id: string;
  loanId: string;
  name: string;
  status: 'Active' | 'Completed' | 'Defaulted';
  amount: number;
  interest: number;
  nextRepayment: string;
}

interface LoansDisbursedTableProps {
  loans: Loan[];
  selectedLoans: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit: (loanId: string) => void;
  onDelete: (loanId: string) => void;
}

type SortColumn = 'loanId' | 'name' | 'status' | 'amount' | 'interest' | 'nextRepayment' | null;
type SortDirection = 'asc' | 'desc';

export default function LoansDisbursedTable({
  loans,
  selectedLoans,
  onSelectionChange,
  onEdit,
  onDelete,
}: LoansDisbursedTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const loansWithIds = loans.filter(loan => loan.id);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(loansWithIds.map(l => l.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (!id) return; // Don't select loans without IDs
    
    if (checked) {
      onSelectionChange([...selectedLoans, id]);
    } else {
      onSelectionChange(selectedLoans.filter(selectedId => selectedId !== id));
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedLoans = [...loans].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortColumn) {
      case 'loanId':
        aValue = a.loanId;
        bValue = b.loanId;
        break;
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'interest':
        aValue = a.interest;
        bValue = b.interest;
        break;
      case 'nextRepayment':
        aValue = new Date(a.nextRepayment).getTime();
        bValue = new Date(b.nextRepayment).getTime();
        break;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const isAllSelected = loansWithIds.length > 0 && selectedLoans.length === loansWithIds.length;

  return (
    <div
      className="bg-white rounded-lg overflow-hidden"
      style={{
        border: '1px solid var(--color-border-gray-200)',
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
      }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-gray-50)', borderBottom: '1px solid var(--color-border-gray-200)' }}>
            <th className="px-6 py-3 text-left" scope="col">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all loans"
              />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
              scope="col"
            >
              <button
                onClick={() => handleSort('loanId')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Loan ID
                {sortColumn === 'loanId' && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
              scope="col"
            >
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Name
                {sortColumn === 'name' && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
              scope="col"
            >
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Status
                {sortColumn === 'status' && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
              scope="col"
            >
              <button
                onClick={() => handleSort('amount')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Amount
                {sortColumn === 'amount' && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
              scope="col"
            >
              <button
                onClick={() => handleSort('interest')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Interest
                {sortColumn === 'interest' && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
              scope="col"
            >
              <button
                onClick={() => handleSort('nextRepayment')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Next Repayment
                {sortColumn === 'nextRepayment' && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke="currentColor"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </th>
            <th className="px-6 py-3" scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLoans.map((loan, index) => {
            // Generate a unique key that handles undefined/null IDs properly
            const uniqueKey = loan.id && loan.id !== 'undefined' && loan.id !== 'null' 
              ? loan.id 
              : `loan-${index}-${loan.loanId || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            return (
              <tr
                key={uniqueKey}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              style={{
                borderBottom: index < loans.length - 1 ? '1px solid var(--color-border-gray-200)' : 'none',
                backgroundColor: loan.id && selectedLoans.includes(loan.id) ? '#F9F5FF' : undefined
              }}
              aria-selected={loan.id ? selectedLoans.includes(loan.id) : false}
            >
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={loan.id ? selectedLoans.includes(loan.id) : false}
                  onCheckedChange={(checked) => loan.id && handleSelectOne(loan.id, checked === true)}
                  aria-label={`Select loan ${loan.loanId}`}
                  disabled={!loan.id}
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {loan.loanId}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {loan.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: loan.status === 'Active' ? '#ECFDF3' : loan.status === 'Completed' ? '#F0F9FF' : '#FEF3F2',
                    color: loan.status === 'Active' ? '#027A48' : loan.status === 'Completed' ? '#026AA2' : '#B42318',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{
                      backgroundColor: loan.status === 'Active' ? '#12B76A' : loan.status === 'Completed' ? '#0BA5EC' : '#F04438',
                    }}
                  />
                  {loan.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  ₦{loan.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {loan.interest}%
                </div>
              </td>
              <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {loan.nextRepayment}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (loan.id) onEdit(loan.id);
                    }}
                    aria-label={`Edit loan ${loan.loanId}`}
                    title="Edit"
                    disabled={!loan.id}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 17.5H17.5M11.6667 4.16667L14.1667 1.66667C14.3877 1.44565 14.6848 1.32031 14.9948 1.32031C15.3047 1.32031 15.6019 1.44565 15.8229 1.66667L18.3333 4.17708C18.5543 4.39811 18.6797 4.69524 18.6797 5.00521C18.6797 5.31518 18.5543 5.61231 18.3333 5.83333L6.66667 17.5H2.5V13.3333L11.6667 4.16667Z"
                        stroke="#475467"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (loan.id) onDelete(loan.id);
                    }}
                    aria-label={`Delete loan ${loan.loanId}`}
                    title="Delete"
                    disabled={!loan.id}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M7.5 2.5H12.5M2.5 5H17.5M15.8333 5L15.2489 13.7661C15.1612 15.0813 15.1174 15.7389 14.8333 16.2375C14.5833 16.6765 14.206 17.0294 13.7514 17.2497C13.235 17.5 12.5759 17.5 11.2578 17.5H8.74221C7.42409 17.5 6.76503 17.5 6.24861 17.2497C5.79396 17.0294 5.41674 16.6765 5.16665 16.2375C4.88259 15.7389 4.83875 15.0813 4.75107 13.7661L4.16667 5"
                        stroke="#475467"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
