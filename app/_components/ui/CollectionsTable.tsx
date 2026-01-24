'use client';

import { useState } from 'react';
import { Checkbox } from './Checkbox';

interface CollectionTransaction {
  id: string;
  transactionId: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  customerName?: string;
}

interface CollectionsTableProps {
  transactions: CollectionTransaction[];
  selectedTransactions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
}

type SortColumn = 'transactionId' | 'type' | 'amount' | 'status' | 'date' | null;
type SortDirection = 'asc' | 'desc';

export default function CollectionsTable({
  transactions,
  selectedTransactions,
  onSelectionChange,
  onEdit,
  onDelete,
}: CollectionsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(transactions.map(t => t.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTransactions, id]);
    } else {
      onSelectionChange(selectedTransactions.filter(selectedId => selectedId !== id));
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

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string | number = '';
    let bValue: string | number = '';

    switch (sortColumn) {
      case 'transactionId':
        aValue = a.transactionId;
        bValue = b.transactionId;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const isAllSelected = transactions.length > 0 && selectedTransactions.length === transactions.length;

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
                aria-label="Select all transactions"
              />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
              scope="col"
            >
              <button
                onClick={() => handleSort('transactionId')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Transaction ID
                {sortColumn === 'transactionId' && (
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
                onClick={() => handleSort('type')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Type
                {sortColumn === 'type' && (
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
                onClick={() => handleSort('date')}
                className="flex items-center gap-1 hover:text-[#101828] transition-colors"
              >
                Date
                {sortColumn === 'date' && (
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
          {sortedTransactions.map((transaction, index) => (
            <tr
              key={transaction.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              style={{
                borderBottom: index < transactions.length - 1 ? '1px solid var(--color-border-gray-200)' : 'none',
                backgroundColor: selectedTransactions.includes(transaction.id) ? '#F9F5FF' : undefined
              }}
              aria-selected={selectedTransactions.includes(transaction.id)}
            >
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedTransactions.includes(transaction.id)}
                  onCheckedChange={(checked) => handleSelectOne(transaction.id, checked === true)}
                  aria-label={`Select transaction ${transaction.transactionId}`}
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {transaction.transactionId}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {transaction.type}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  ₦{transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: transaction.status === 'Completed' ? '#ECFDF3' : transaction.status === 'Pending' ? '#FFF4ED' : '#FEF3F2',
                    color: transaction.status === 'Completed' ? '#027A48' : transaction.status === 'Pending' ? '#CC7720' : '#B42318',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{
                      backgroundColor: transaction.status === 'Completed' ? '#12B76A' : transaction.status === 'Pending' ? '#FF9326' : '#F04438',
                    }}
                  />
                  {transaction.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {transaction.date}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(transaction.id);
                    }}
                    aria-label={`Edit transaction ${transaction.transactionId}`}
                    title="Edit"
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
                      onDelete(transaction.id);
                    }}
                    aria-label={`Delete transaction ${transaction.transactionId}`}
                    title="Delete"
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
