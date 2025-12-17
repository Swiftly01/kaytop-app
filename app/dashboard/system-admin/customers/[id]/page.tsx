/**
 * Customer Details Page
 * Display comprehensive customer information including accounts, loans, and transactions
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountCard from '@/app/_components/ui/AccountCard';
import CustomerInfoCard from '@/app/_components/ui/CustomerInfoCard';
import ActiveLoanCard from '@/app/_components/ui/ActiveLoanCard';
import TransactionHistoryTable from '@/app/_components/ui/TransactionHistoryTable';
import SavingsTransactionsTable from '@/app/_components/ui/SavingsTransactionsTable';
import SavingsDepositModal from '@/app/_components/ui/SavingsDepositModal';
import SavingsWithdrawalModal from '@/app/_components/ui/SavingsWithdrawalModal';
import LoanCoverageModal from '@/app/_components/ui/LoanCoverageModal';
import TransactionApprovalModal from '@/app/_components/ui/TransactionApprovalModal';
import { userService } from '@/lib/services/users';
import { loanService } from '@/lib/services/loans';
import { savingsService } from '@/lib/services/savings';
import { useToast } from '@/app/hooks/useToast';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
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

export default function CustomerDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, removeToast, error } = useToast();

  // API data state
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isLoanCoverageModalOpen, setIsLoanCoverageModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Transform API data to CustomerDetails format
  const transformApiDataToCustomerDetails = (
    user: User,
    loans: Loan[],
    savings: SavingsAccount | null
  ): CustomerDetails => {
    const activeLoan = loans.find(loan => loan.status === 'active') || loans[0];
    
    return {
      id: String(user.id), // Ensure ID is string
      name: `${user.firstName} ${user.lastName}`,
      userId: String(user.id).slice(-8).toUpperCase(),
      dateJoined: new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      email: user.email,
      phoneNumber: user.mobileNumber,
      gender: 'Not specified', // This field might not be available in the API
      address: 'Not specified', // This field might not be available in the API
      loanRepayment: {
        amount: activeLoan ? activeLoan.amount * 0.1 : 0, // Assuming 10% monthly payment
        nextPayment: activeLoan?.nextRepaymentDate ? 
          new Date(activeLoan.nextRepaymentDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }) : 'N/A',
        growth: 5 // Placeholder
      },
      savingsAccount: {
        balance: savings?.balance || 0,
        growth: 12, // Placeholder
        chartData: [25, 30, 20, 25] // Placeholder chart data
      },
      activeLoan: activeLoan ? {
        loanId: String(activeLoan.id).slice(-8).toUpperCase(),
        amount: activeLoan.amount,
        outstanding: activeLoan.amount * 0.7, // Placeholder - 70% outstanding
        monthlyPayment: activeLoan.amount * 0.1, // Placeholder - 10% monthly
        interestRate: activeLoan.interestRate,
        startDate: activeLoan.createdAt,
        endDate: activeLoan.nextRepaymentDate || activeLoan.createdAt,
        paymentSchedule: [] as Array<{
          id: string;
          paymentNumber: number;
          amount: number;
          status: 'Paid' | 'Missed' | 'Upcoming';
          dueDate: Date;
          isPaid: boolean;
        }> // Would need separate API call for payment schedule
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
      transactions: savings?.transactions.map(transaction => ({
        id: String(transaction.id), // Ensure ID is string
        transactionId: String(transaction.id).slice(-8).toUpperCase(),
        type: transaction.type === 'deposit' ? 'Savings' : 'Repayment',
        amount: transaction.amount,
        status: transaction.status === 'approved' ? 'Successful' : 
                transaction.status === 'rejected' ? 'Pending' : 'In Progress',
        date: new Date(transaction.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      })) || []
    };
  };

  // Fetch customer details from API
  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Fetch user details
      const user = await userService.getUserById(id);
      if (user.role !== 'customer') {
        throw new Error('User is not a customer');
      }

      // Fetch customer loans
      let loans: Loan[] = [];
      try {
        loans = await loanService.getCustomerLoans(id);
      } catch (err) {
        console.warn('Failed to fetch customer loans:', err);
        // Continue without loan data
      }

      // Fetch customer savings
      let savings: SavingsAccount | null = null;
      try {
        savings = await savingsService.getCustomerSavings(id);
      } catch (err) {
        console.warn('Failed to fetch customer savings:', err);
        // Continue without savings data
      }

      const details = transformApiDataToCustomerDetails(user, loans, savings);
      setCustomerDetails(details);
      setSavingsAccount(savings);

    } catch (err) {
      console.error('Failed to fetch customer details:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load customer details');
      error('Failed to load customer details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle savings operations success
  const handleSavingsOperationSuccess = () => {
    // Refresh customer details to show updated data
    fetchCustomerDetails();
  };

  // Handle transaction approval
  const handleTransactionApproval = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsApprovalModalOpen(true);
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

  // Calculate loan repayment percentage for donut chart
  const loanAmount = customerDetails.activeLoan.amount;
  const loanOutstanding = customerDetails.activeLoan.outstanding;
  const loanPaid = loanAmount - loanOutstanding;
  const loanPercentage = (loanPaid / loanAmount) * 100;
  
  // Prepare chart data (kept for backwards compatibility)
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
              onClick={() => router.push('/dashboard/system-admin/customers')}
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

          {/* Savings Actions */}
          <div className="mb-6">
            <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
              <h3 className="text-[18px] font-semibold text-[#101828] mb-4">
                Savings Operations
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-4 py-2 text-[14px] font-semibold text-white bg-[#039855] border border-[#039855] rounded-lg hover:bg-[#027A48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#039855] focus:ring-offset-2"
                >
                  Record Deposit
                </button>
                <button
                  onClick={() => setIsWithdrawalModalOpen(true)}
                  className="px-4 py-2 text-[14px] font-semibold text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                  disabled={!savingsAccount || savingsAccount.balance <= 0}
                >
                  Record Withdrawal
                </button>
                <button
                  onClick={() => setIsLoanCoverageModalOpen(true)}
                  className="px-4 py-2 text-[14px] font-semibold text-white bg-[#7F56D9] border border-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                  disabled={!savingsAccount || savingsAccount.balance <= 0}
                >
                  Use for Loan Coverage
                </button>
              </div>
              {savingsAccount && savingsAccount.balance <= 0 && (
                <p className="text-[12px] text-[#667085] mt-2">
                  Withdrawal and loan coverage options are disabled when balance is zero.
                </p>
              )}
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

          {/* Savings Transactions Table */}
          {savingsAccount && savingsAccount.transactions && savingsAccount.transactions.length > 0 && (
            <div className="mb-8">
              <SavingsTransactionsTable 
                transactions={savingsAccount.transactions}
                onApproveTransaction={handleTransactionApproval}
              />
            </div>
          )}

          {/* Transaction History Table */}
          <div>
            <TransactionHistoryTable 
              transactions={customerDetails.transactions}
              onTransactionAction={handleTransactionApproval}
            />
          </div>
        </div>
      </main>
      
      {/* Savings Modals */}
      <SavingsDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        customerId={id}
        customerName={customerDetails.name}
        onSuccess={handleSavingsOperationSuccess}
      />
      
      <SavingsWithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        customerId={id}
        customerName={customerDetails.name}
        currentBalance={savingsAccount?.balance || 0}
        onSuccess={handleSavingsOperationSuccess}
      />
      
      <LoanCoverageModal
        isOpen={isLoanCoverageModalOpen}
        onClose={() => setIsLoanCoverageModalOpen(false)}
        customerId={id}
        customerName={customerDetails.name}
        currentBalance={savingsAccount?.balance || 0}
        onSuccess={handleSavingsOperationSuccess}
      />
      
      <TransactionApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        transaction={selectedTransaction}
        onSuccess={handleSavingsOperationSuccess}
      />
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
