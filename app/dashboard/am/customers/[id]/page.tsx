/**
 * AM Customer Details Page
 * Display comprehensive customer information for Account Manager oversight
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountCard from '@/app/_components/ui/AccountCard';
import CustomerInfoCard from '@/app/_components/ui/CustomerInfoCard';
import ActiveLoanCard from '@/app/_components/ui/ActiveLoanCard';
import TransactionHistoryTable from '@/app/_components/ui/TransactionHistoryTable';
import SavingsTransactionsTable from '@/app/_components/ui/SavingsTransactionsTable';
import { unifiedUserService } from '@/lib/services/unifiedUser';
import { unifiedLoanService } from '@/lib/services/unifiedLoan';
import { unifiedSavingsService } from '@/lib/services/unifiedSavings';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { formatDate } from '@/lib/utils';
import { formatCustomerDate } from '@/lib/dateUtils';
import type { User, Loan, SavingsAccount, Transaction } from '@/lib/api/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CustomerDetails {
  id: string;
  name: string;
  userId: string;
  dateJoined: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
  branch: string;
  creditOfficer: string;
  riskScore: string;
  loanRepayment: {
    amount: number;
    nextPayment: string;
    growth: number;
  };
  savingsAccount: {
    balance: number;
    growth: number;
    chartData: number[];
  };
  activeLoan: {
    loanId: string;
    amount: number;
    outstanding: number;
    monthlyPayment: number;
    interestRate: number;
    startDate: string;
    endDate: string;
    paymentSchedule: Array<{
      id: string;
      paymentNumber: number;
      amount: number;
      status: 'Paid' | 'Missed' | 'Upcoming';
      dueDate: Date;
      isPaid: boolean;
    }>;
  };
  transactions: Array<{
    id: string;
    transactionId: string;
    type: 'Repayment' | 'Savings';
    amount: number;
    status: 'Successful' | 'Pending' | 'In Progress';
    date: string;
  }>;
}

export default function AMCustomerDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, removeToast, error, success } = useToast();

  // API data state
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Transform API data to CustomerDetails format
  const transformApiDataToCustomerDetails = (
    customer: any,
    loans: any[] = [],
    savings: any = null
  ): CustomerDetails => {
    const activeLoan = loans.find(loan => loan.status === 'active') || loans[0];

    return {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      userId: customer.customerId || String(customer.id).slice(-8).toUpperCase(),
      dateJoined: formatCustomerDate(customer.joinDate || customer.createdAt),
      email: customer.email,
      phoneNumber: customer.mobileNumber || customer.phone,
      gender: customer.gender || 'Not specified',
      address: customer.address || 'Not specified',
      branch: customer.branch || 'Not assigned',
      creditOfficer: customer.creditOfficer || 'Not assigned',
      riskScore: customer.riskScore || 'Low',
      loanRepayment: {
        amount: activeLoan ? activeLoan.amount * 0.1 : 0, // Assuming 10% monthly payment
        nextPayment: activeLoan?.nextRepaymentDate ?
          formatDate(activeLoan.nextRepaymentDate) || 'N/A' : 'N/A',
        growth: 5 // Placeholder
      },
      savingsAccount: {
        balance: savings?.balance || customer.savingsBalance || 0,
        growth: 12, // Placeholder
        chartData: [25, 30, 20, 25] // Placeholder chart data
      },
      activeLoan: activeLoan ? {
        loanId: String(activeLoan.id).slice(-8).toUpperCase(),
        amount: activeLoan.amount,
        outstanding: activeLoan.amount * 0.7, // Placeholder - 70% outstanding
        monthlyPayment: activeLoan.amount * 0.1, // Placeholder - 10% monthly
        interestRate: activeLoan.interestRate || 15,
        startDate: activeLoan.createdAt || activeLoan.disbursementDate,
        endDate: activeLoan.nextRepaymentDate || activeLoan.createdAt,
        paymentSchedule: [] // Would need separate API call for payment schedule
      } : {
        loanId: 'N/A',
        amount: 0,
        outstanding: 0,
        monthlyPayment: 0,
        interestRate: 0,
        startDate: '',
        endDate: '',
        paymentSchedule: []
      },
      transactions: [] // Would be populated from separate API calls
    };
  };

  // Fetch customer details from AM API
  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Fetch customer details using unified service
      const customer = await unifiedUserService.getUserById(id);

      // Fetch customer loans
      let loans: any[] = [];
      try {
        const loansResponse = await unifiedLoanService.getCustomerLoans(id);
        loans = loansResponse.data || [];
      } catch (err) {
        console.warn('Failed to fetch customer loans:', err);
        // Continue without loan data
      }

      // Fetch customer savings
      let savings: any = null;
      try {
        const savingsResponse = await unifiedSavingsService.getCustomerSavings(id);
        savings = savingsResponse || null;
      } catch (err) {
        console.warn('Failed to fetch customer savings:', err);
        // Continue without savings data
      }

      const details = transformApiDataToCustomerDetails(customer, loans, savings);
      setCustomerDetails(details);

    } catch (err) {
      console.error('Failed to fetch AM customer details:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load customer details');
      error('Failed to load customer details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  // Show loading state
  if (isLoading || !customerDetails) {
    return (
      <div className="drawer-content flex flex-col min-h-screen">
        <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
          <div className="w-full" style={{ maxWidth: '1200px' }}>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="flex gap-6 mb-6">
                <div className="h-32 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-24 bg-gray-200 rounded mb-6"></div>
              <div className="h-32 bg-gray-200 rounded mb-8"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // Show error state
  if (apiError) {
    return (
      <div className="drawer-content flex flex-col min-h-screen">
        <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
          <div className="w-full" style={{ maxWidth: '1200px' }}>
            <div className="mb-6">
              <button
                onClick={() => router.push('/dashboard/am/customers')}
                className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
                aria-label="Go back to customers list"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-800 font-medium mb-2">Error Loading Customer Details</div>
              <div className="text-red-700 text-sm mb-4">{apiError}</div>
              <button
                onClick={fetchCustomerDetails}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // Calculate loan repayment percentage for donut chart
  const loanAmount = customerDetails.activeLoan.amount;
  const loanOutstanding = customerDetails.activeLoan.outstanding;
  const loanPaid = loanAmount - loanOutstanding;
  const loanPercentage = loanAmount > 0 ? (loanPaid / loanAmount) * 100 : 0;

  // Prepare chart data
  const loanChartData = [
    { value: loanPaid, color: '#7F56D9' },
    { value: loanOutstanding, color: '#F4EBFF' }
  ];

  // Prepare pie chart data for savings account
  const savingsChartData = customerDetails.savingsAccount.chartData.map((value, index) => {
    const colors = ['#475467', '#667085', '#98A2B3', '#D0D5DD'];
    return {
      value,
      color: colors[index] || '#D0D5DD'
    };
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        {/* Container with proper max width */}
        <div className="w-full" style={{ maxWidth: '1200px' }}>
          {/* Back Button and Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard/am/customers')}
              className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
              aria-label="Go back to customers list"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h1
              className="text-2xl font-bold"
              style={{ color: '#021C3E', fontSize: '24px' }}
            >
              Customer Details
            </h1>
          </div>

          {/* Account Cards */}
          <div className="flex gap-6 mb-6">
            <AccountCard
              title="Loan Repayment"
              subtitle={`Next Payment - ${customerDetails.loanRepayment.nextPayment}`}
              amount={formatCurrency(customerDetails.loanRepayment.amount)}
              growth={customerDetails.loanRepayment.growth}
              chartData={loanChartData}
              chartType="loan"
              percentage={loanPercentage}
            />
            <AccountCard
              title="Savings Account"
              subtitle="Current balance"
              amount={formatCurrency(customerDetails.savingsAccount.balance)}
              growth={customerDetails.savingsAccount.growth}
              chartData={savingsChartData}
              chartType="savings"
            />
          </div>

          {/* AM-Specific Customer Management */}
          <div className="mb-6">
            <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
              <h3 className="text-[18px] font-semibold text-[#101828] mb-4">
                Account Management
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-[#667085]">Branch</p>
                  <p className="text-base font-medium text-[#101828]">{customerDetails.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-[#667085]">Credit Officer</p>
                  <p className="text-base font-medium text-[#101828]">{customerDetails.creditOfficer}</p>
                </div>
                <div>
                  <p className="text-sm text-[#667085]">Risk Score</p>
                  <p className="text-base font-medium text-[#101828]">{customerDetails.riskScore}</p>
                </div>
                <div>
                  <p className="text-sm text-[#667085]">Customer ID</p>
                  <p className="text-base font-medium text-[#101828]">{customerDetails.userId}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => success('Customer assignment feature coming soon!')}
                  className="px-4 py-2 text-[14px] font-semibold text-white bg-[#7F56D9] border border-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                >
                  Reassign Customer
                </button>
                <button
                  onClick={() => success('Customer communication feature coming soon!')}
                  className="px-4 py-2 text-[14px] font-semibold text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                >
                  Contact Customer
                </button>
                <button
                  onClick={() => router.push(`/dashboard/am/customers/${id}/loans`)}
                  className="px-4 py-2 text-[14px] font-semibold text-[#039855] bg-white border border-[#039855] rounded-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#039855] focus:ring-offset-2"
                >
                  View Loans
                </button>
              </div>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="mb-6">
            <CustomerInfoCard
              customerName={customerDetails.name}
              userId={customerDetails.userId}
              dateJoined={customerDetails.dateJoined}
              email={customerDetails.email}
              phoneNumber={customerDetails.phoneNumber}
              gender={customerDetails.gender}
              address={customerDetails.address}
            />
          </div>

          {/* Active Loan Card */}
          <div className="mb-8">
            <ActiveLoanCard
              loanId={customerDetails.activeLoan.loanId}
              amount={customerDetails.activeLoan.amount}
              outstanding={customerDetails.activeLoan.outstanding}
              monthlyPayment={customerDetails.activeLoan.monthlyPayment}
              interestRate={customerDetails.activeLoan.interestRate}
              startDate={customerDetails.activeLoan.startDate}
              endDate={customerDetails.activeLoan.endDate}
              paymentSchedule={customerDetails.activeLoan.paymentSchedule}
            />
          </div>

          {/* Transaction History Table */}
          <div>
            <TransactionHistoryTable
              transactions={customerDetails.transactions}
              onTransactionAction={(transaction) => {
                success('Transaction details feature coming soon!');
              }}
            />
          </div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}