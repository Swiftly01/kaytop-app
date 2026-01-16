'use client';

import { useState } from 'react';
import { Checkbox } from './Checkbox';
import Pagination from './Pagination';
import type { Transaction } from '@/lib/api/types';

interface SavingsTransactionsTableProps {
  transactions: Transaction[];
  onApproveTransaction?: (transaction: Transaction) => void;
}

// Transaction Type Badge Component
function TransactionTypeBadge({ type }: { type: 'deposit' | 'withdrawal' | 'loan_coverage' }) {
  const styles = {
    deposit: {
      bg: '#ECFDF3',
      text: '#027A48',
      dot: '#12B76A'
    },
    withdrawal: {
      bg: '#FEF3F2',
      text: '#B42318',
      dot: '#F04438'
    },
    loan_coverage: {
      bg: '#EFF4FF',
      text: '#1754CC',
      dot: '#0C3C9D'
    }
  };

  const style = styles[type];
  const label = type === 'loan_coverage' ? 'Loan Coverage' : 
                type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        backgroundColor: style.bg,
        padding: '2px 8px 2px 6px',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        color: style.text
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: style.dot
        }}
      />
      {label}
    </span>
  );
}

// Transaction Status Badge Component
function TransactionStatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const styles = {
    pending: {
      bg: '#FFFCF5',
      text: '#F79009',
      dot: '#F79009'
    },
    approved: {
      bg: '#ECFDF3',
      text: '#027A48',
      dot: '#12B76A'
    },
    rejected: {
      bg: '#FEF3F2',
      text: '#B42318',
      dot: '#F04438'
    }
  };

  const style = styles[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        backgroundColor: style.bg,
        padding: '2px 8px 2px 6px',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        color: style.text
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: style.dot
        }}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function SavingsTransactionsTable({ 
  transactions, 
  onApproveTransaction 
}: SavingsTransactionsTableProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'type' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const itemsPerPage = 10;

  // Sort transactions
  let sortedTransactions = [...transactions];
  if (sortColumn) {
    sortedTransactions.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Paginate transactions
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(paginatedTransactions.map(t => String(t.id)));
    }
  };

  // Handle individual selection
  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  // Handle sorting
  const handleSort = (column: 'type' | 'status') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (transactions.length === 0) {
    return (
      <div style={{ maxWidth: '967px', margin: '0 auto' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#101828' }}>
          Savings Transactions
        </h3>
        <div className="text-center py-12 bg-white border border-[#EAECF0] rounded-lg">
          <p className="text-[#667085] text-sm">No savings transactions found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '967px', margin: '0 auto' }}>
      {/* Title */}
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#101828' }}>
        Savings Transactions
      </h3>

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAECF0'
        }}
      >
        <table className="w-full">
          <thead style={{ backgroundColor: '#F9FAFB' }}>
            <tr>
              <th className="text-left" style={{ padding: '12px 24px' }}>
                <Checkbox
                  checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all transactions"
                />
              </th>
              <th
                className="text-left text-xs font-medium"
                style={{ color: '#475467', padding: '12px 24px' }}
              >
                Transaction ID
              </th>
              <th
                className="text-left text-xs font-medium"
                style={{ color: '#475467', padding: '12px 24px' }}
              >
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 hover:text-[#7F56D9] transition-colors cursor-pointer"
                >
                  Type
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    className={`transition-transform ${sortColumn === 'type' && sortDirection === 'desc' ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                      stroke={sortColumn === 'type' ? '#7F56D9' : '#475467'}
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </th>
              <th
                className="text-left text-xs font-medium"
                style={{ color: '#475467', padding: '12px 24px' }}
              >
                Amount
              </th>
              <th
                className="text-left text-xs font-medium"
                style={{ color: '#475467', padding: '12px 24px' }}
              >
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-[#7F56D9] transition-colors cursor-pointer"
                >
                  Status
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
              <th
                className="text-left text-xs font-medium"
                style={{ color: '#475467', padding: '12px 24px' }}
              >
                Description
              </th>
              <th
                className="text-left text-xs font-medium"
                style={{ color: '#475467', padding: '12px 24px' }}
              >
                Date
              </th>
              {onApproveTransaction && (
                <th
                  className="text-left text-xs font-medium"
                  style={{ color: '#475467', padding: '12px 24px' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                style={{
                  borderBottom: '1px solid #EAECF0',
                  height: '72px'
                }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <Checkbox
                    checked={selectedTransactions.includes(String(transaction.id))}
                    onChange={() => handleSelectTransaction(String(transaction.id))}
                    aria-label={`Select transaction ${String(transaction.id).slice(-8).toUpperCase()}`}
                  />
                </td>
                <td
                  className="text-sm font-normal"
                  style={{ color: '#475467', padding: '16px 24px' }}
                >
                  #{String(transaction.id).slice(-8).toUpperCase()}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <TransactionTypeBadge type={transaction.type} />
                </td>
                <td
                  className="text-sm font-normal"
                  style={{ color: '#475467', padding: '16px 24px' }}
                >
                  {formatCurrency(transaction.amount)}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <TransactionStatusBadge status={transaction.status} />
                </td>
                <td
                  className="text-sm font-normal"
                  style={{ color: '#475467', padding: '16px 24px', maxWidth: '200px' }}
                >
                  <div className="truncate" title={transaction.description}>
                    {transaction.description || 'No description'}
                  </div>
                </td>
                <td
                  className="text-sm font-normal"
                  style={{ color: '#475467', padding: '16px 24px' }}
                >
                  {formatDate(transaction.createdAt)}
                </td>
                {onApproveTransaction && (
                  <td style={{ padding: '16px 24px' }}>
                    {transaction.status === 'pending' && (
                      <button
                        onClick={() => onApproveTransaction(transaction)}
                        className="px-3 py-1 text-[12px] font-medium text-[#039855] bg-[#ECFDF3] border border-[#ABEFC6] rounded-md hover:bg-[#D1FADF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#039855] focus:ring-offset-1"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}