/**
 * TransactionHistoryTable Component
 * Display transaction history with pagination, sorting, and selection
 */

'use client';

import { useState } from 'react';
import { Checkbox } from './Checkbox';
import Pagination from './Pagination';
import type { Transaction as ApiTransaction } from '@/lib/api/types';

// Local Transaction interface for display purposes
interface Transaction {
  id: string;
  transactionId: string;
  type: 'Repayment' | 'Savings';
  amount: number;
  status: 'Successful' | 'Pending' | 'In Progress';
  date: string;
}

interface TransactionHistoryTableProps {
  transactions: Transaction[];
  onTransactionAction?: (transaction: ApiTransaction) => void;
}

// Transaction Type Badge Component
function TransactionTypeBadge({ type }: { type: 'Repayment' | 'Savings' }) {
  const styles = {
    Repayment: {
      bg: '#EFF4FF',
      text: '#1754CC',
      dot: '#0C3C9D'
    },
    Savings: {
      bg: 'rgba(5, 206, 96, 0.1)',
      text: 'rgba(13, 144, 72, 0.99)',
      dot: '#05CE60'
    }
  };

  const style = styles[type];

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
      {type}
    </span>
  );
}

// Transaction Status Badge Component
function TransactionStatusBadge({ status }: { status: 'Successful' | 'Pending' | 'In Progress' }) {
  const styles = {
    Successful: {
      bg: '#ECFDF3',
      text: '#027A48',
      dot: '#12B76A'
    },
    Pending: {
      bg: 'rgba(255, 147, 38, 0.1)',
      text: 'rgba(204, 119, 32, 0.99)',
      dot: '#FF9326'
    },
    'In Progress': {
      bg: '#EFF4FF',
      text: '#1754CC',
      dot: '#0C3C9D'
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
      {status}
    </span>
  );
}

export default function TransactionHistoryTable({ transactions, onTransactionAction }: TransactionHistoryTableProps) {
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
      setSelectedTransactions(paginatedTransactions.map(t => t.id));
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

  return (
    <div style={{ maxWidth: '967px', margin: '0 auto' }}>
      {/* Title */}
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: '#101828' }}
      >
        Transaction History
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
                Date
              </th>
              {onTransactionAction && (
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
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={() => handleSelectTransaction(transaction.id)}
                    aria-label={`Select transaction ${transaction.transactionId}`}
                  />
                </td>
                <td
                  className="text-sm font-normal"
                  style={{ color: '#475467', padding: '16px 24px' }}
                >
                  {transaction.transactionId}
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
                  style={{ color: '#475467', padding: '16px 24px' }}
                >
                  {transaction.date}
                </td>
                {onTransactionAction && (
                  <td style={{ padding: '16px 24px' }}>
                    {transaction.status === 'Pending' && (
                      <button
                        onClick={() => onTransactionAction({
                          id: transaction.id,
                          type: transaction.type === 'Savings' ? 'deposit' : 'withdrawal',
                          amount: transaction.amount,
                          description: `Transaction ${transaction.transactionId}`,
                          status: 'pending',
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        })}
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
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
