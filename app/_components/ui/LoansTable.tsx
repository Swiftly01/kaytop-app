'use client';

/**
 * LoansTable Component
 * Displays loan records in a table format with selection checkboxes
 */

import StatusBadge from './StatusBadge';
import { Checkbox } from './Checkbox';

// Local LoanRecord interface for display purposes
interface LoanRecord {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'overdue';
  nextRepaymentDate: string;
  interestRate: number;
  term: number;
}

interface LoansTableProps {
  loans: LoanRecord[];
  selectedLoans: string[];
  onSelectLoan: (loanId: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onLoanClick?: (loan: LoanRecord) => void;
}

/**
 * Format loan ID with "ID: " prefix
 */
function formatLoanId(loanId: string): string {
  return `ID: ${loanId}`;
}

/**
 * Format amount as Nigerian Naira with comma separators
 */
function formatAmount(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/**
 * Format interest rate with one decimal place
 */
function formatInterestRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * Format date as "Month DD, YYYY"
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
}

export default function LoansTable({
  loans,
  selectedLoans,
  onSelectLoan,
  onSelectAll,
  allSelected,
  onLoanClick
}: LoansTableProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#EAECF0] overflow-hidden">
      <table 
        className="w-full"
        style={{ fontFamily: "'Open Sauce Sans', sans-serif" }}
        role="table"
        aria-label="Loans table"
      >
        <thead>
          <tr className="border-b border-[#EAECF0] bg-[#F9FAFB]">
            <th className="px-6 py-3 text-left w-12" scope="col">
              <Checkbox
                checked={allSelected}
                onChange={onSelectAll}
                aria-label="Select all loans on current page"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#475467]" scope="col">
              Loan ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#475467]" scope="col">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#475467]" scope="col">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#475467]" scope="col">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#475467]" scope="col">
              Interest
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#475467]" scope="col">
              Next Repayment
            </th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => {
            const isSelected = selectedLoans.includes(loan.id);
            
            return (
              <tr
                key={loan.id}
                className="border-b border-[#EAECF0] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                onClick={() => onLoanClick?.(loan)}
              >
                <td className="px-6 py-4">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onSelectLoan(loan.id)}
                    aria-label={`Select loan ${loan.id}`}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-[#475467]">
                  {formatLoanId(loan.id)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-[#101828]">
                  {loan.customerName}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={loan.status} />
                </td>
                <td className="px-6 py-4 text-sm text-[#475467]">
                  {formatAmount(loan.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-[#475467]">
                  {formatInterestRate(loan.interestRate)}
                </td>
                <td className="px-6 py-4 text-sm text-[#475467]">
                  {formatDate(loan.nextRepaymentDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
