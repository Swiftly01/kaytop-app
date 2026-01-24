/**
 * AM Loan Details Page
 * Display comprehensive loan information with AM oversight capabilities
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';
import { unifiedLoanService } from '@/lib/services/unifiedLoan';
import type { Loan } from '@/lib/api/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface LoanDetails {
  id: string;
  loanId: string;
  customerName: string;
  customerId: string;
  amount: number;
  interestRate: number;
  status: string;
  stage: string;
  purpose: string;
  disbursementDate: string;
  nextRepaymentDate: string;
  term: number;
  monthlyPayment: number;
  outstanding: number;
  creditOfficer: string;
  branch: string;
  applicationDate: string;
  approvalDate?: string;
  riskScore: string;
  collateral?: string;
  guarantor?: string;
  paymentHistory: Array<{
    id: string;
    amount: number;
    date: string;
    status: 'paid' | 'missed' | 'pending';
  }>;
}

export default function AMLoanDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();

  // State management
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Transform API loan data to LoanDetails format
  const transformLoanData = (loan: any): LoanDetails => ({
    id: loan.id,
    loanId: loan.loanId || `LN-${String(loan.id).slice(-6)}`,
    customerName: loan.customerName || 'Unknown Customer',
    customerId: loan.customerId || String(loan.customer_id || ''),
    amount: loan.amount,
    interestRate: loan.interestRate || 15,
    status: loan.status || 'pending',
    stage: loan.stage || 'inquiry',
    purpose: loan.purpose || 'Business',
    disbursementDate: loan.disbursementDate || loan.createdAt,
    nextRepaymentDate: loan.nextRepaymentDate || loan.dueDate,
    term: loan.term || loan.tenure || 12,
    monthlyPayment: loan.monthlyPayment || (loan.amount * 0.1), // 10% assumption
    outstanding: loan.outstanding || (loan.amount * 0.7), // 70% assumption
    creditOfficer: loan.creditOfficer || 'Unassigned',
    branch: loan.branch || 'Unknown',
    applicationDate: loan.applicationDate || loan.createdAt,
    approvalDate: loan.approvalDate,
    riskScore: loan.riskScore || 'Medium',
    collateral: loan.collateral,
    guarantor: loan.guarantor,
    paymentHistory: loan.paymentHistory || []
  });

  // Fetch loan details
  const fetchLoanDetails = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const loan = await unifiedLoanService.getLoanById(id);
      const details = transformLoanData(loan);
      setLoanDetails(details);

    } catch (err) {
      console.error('Failed to fetch loan details:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to load loan details');
      error('Failed to load loan details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loan approval
  const handleApproveLoan = async () => {
    if (!loanDetails) return;

    try {
      setIsApproving(true);
      await unifiedLoanService.approveLoan(loanDetails.id, 'Approved by Account Manager');
      success('Loan approved successfully!');
      
      // Refresh loan details
      await fetchLoanDetails();
    } catch (err) {
      console.error('Failed to approve loan:', err);
      error('Failed to approve loan. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle loan decline
  const handleDeclineLoan = async () => {
    if (!loanDetails) return;

    try {
      setIsDeclining(true);
      await unifiedLoanService.declineLoan(loanDetails.id, 'Declined by Account Manager', 'Risk assessment failed');
      success('Loan declined successfully!');
      
      // Refresh loan details
      await fetchLoanDetails();
    } catch (err) {
      console.error('Failed to decline loan:', err);
      error('Failed to decline loan. Please try again.');
    } finally {
      setIsDeclining(false);
    }
  };

  // Handle stage update
  const handleStageUpdate = async (newStage: string) => {
    if (!loanDetails) return;

    try {
      await unifiedLoanService.updateLoanStage(loanDetails.id, newStage, `Updated to ${newStage} by Account Manager`);
      success(`Loan stage updated to ${newStage}!`);
      
      // Refresh loan details
      await fetchLoanDetails();
    } catch (err) {
      console.error('Failed to update loan stage:', err);
      error('Failed to update loan stage. Please try again.');
    }
  };

  // Load initial data
  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'active':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Show loading state
  if (isLoading || !loanDetails) {
    return (
      <div className="drawer-content flex flex-col min-h-screen">
        <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
          <div className="w-full" style={{ maxWidth: '1200px' }}>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
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
                onClick={() => router.push('/dashboard/am/loans')}
                className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
                aria-label="Go back to loans list"
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
              <div className="text-red-800 font-medium mb-2">Error Loading Loan Details</div>
              <div className="text-red-700 text-sm mb-4">{apiError}</div>
              <button
                onClick={fetchLoanDetails}
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

  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="w-full" style={{ maxWidth: '1200px' }}>
          {/* Back Button and Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard/am/loans')}
              className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
              aria-label="Go back to loans list"
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

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#021C3E] mb-2">
                  Loan Details - {loanDetails.loanId}
                </h1>
                <p className="text-[#667085]">
                  {loanDetails.customerName} • {loanDetails.branch}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(loanDetails.status)}`}>
                  {loanDetails.status.charAt(0).toUpperCase() + loanDetails.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200">
                  {loanDetails.stage.charAt(0).toUpperCase() + loanDetails.stage.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Loan Overview */}
              <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Loan Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-[#667085]">Loan Amount</p>
                    <p className="text-xl font-semibold text-[#101828]">{formatCurrency(loanDetails.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Interest Rate</p>
                    <p className="text-xl font-semibold text-[#101828]">{loanDetails.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Term</p>
                    <p className="text-xl font-semibold text-[#101828]">{loanDetails.term} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Monthly Payment</p>
                    <p className="text-xl font-semibold text-[#101828]">{formatCurrency(loanDetails.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Outstanding</p>
                    <p className="text-xl font-semibold text-[#101828]">{formatCurrency(loanDetails.outstanding)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Purpose</p>
                    <p className="text-xl font-semibold text-[#101828]">{loanDetails.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#667085]">Customer Name</p>
                    <p className="text-base font-medium text-[#101828]">{loanDetails.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Customer ID</p>
                    <p className="text-base font-medium text-[#101828]">{loanDetails.customerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Credit Officer</p>
                    <p className="text-base font-medium text-[#101828]">{loanDetails.creditOfficer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#667085]">Risk Score</p>
                    <p className="text-base font-medium text-[#101828]">{loanDetails.riskScore}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => router.push(`/dashboard/am/customers/${loanDetails.customerId}`)}
                    className="px-4 py-2 text-sm font-medium text-[#7F56D9] bg-white border border-[#7F56D9] rounded-lg hover:bg-[#F4F3FF] transition-colors"
                  >
                    View Customer
                  </button>
                  <button
                    onClick={() => success('Customer communication feature coming soon!')}
                    className="px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Contact Customer
                  </button>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Payment History</h3>
                {loanDetails.paymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {loanDetails.paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-[#101828]">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-[#667085]">{formatDate(payment.date)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'missed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#667085] text-center py-8">No payment history available</p>
                )}
              </div>
            </div>

            {/* Right Column - Actions & Timeline */}
            <div className="space-y-6">
              {/* Loan Actions */}
              <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Loan Actions</h3>
                <div className="space-y-3">
                  {loanDetails.status === 'pending' && (
                    <>
                      <button
                        onClick={handleApproveLoan}
                        disabled={isApproving}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-[#039855] rounded-lg hover:bg-[#027A48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApproving ? 'Approving...' : 'Approve Loan'}
                      </button>
                      <button
                        onClick={handleDeclineLoan}
                        disabled={isDeclining}
                        className="w-full px-4 py-2 text-sm font-medium text-[#E43535] bg-white border border-[#E43535] rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeclining ? 'Declining...' : 'Decline Loan'}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => success('Loan modification feature coming soon!')}
                    className="w-full px-4 py-2 text-sm font-medium text-[#7F56D9] bg-white border border-[#7F56D9] rounded-lg hover:bg-[#F4F3FF] transition-colors"
                  >
                    Modify Terms
                  </button>
                  
                  <button
                    onClick={() => success('Document management feature coming soon!')}
                    className="w-full px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Documents
                  </button>
                </div>
              </div>

              {/* Loan Timeline */}
              <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Loan Timeline</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#667085]">Application Date</p>
                    <p className="text-base font-medium text-[#101828]">{formatDate(loanDetails.applicationDate)}</p>
                  </div>
                  
                  {loanDetails.approvalDate && (
                    <div>
                      <p className="text-sm text-[#667085]">Approval Date</p>
                      <p className="text-base font-medium text-[#101828]">{formatDate(loanDetails.approvalDate)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-[#667085]">Disbursement Date</p>
                    <p className="text-base font-medium text-[#101828]">{formatDate(loanDetails.disbursementDate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[#667085]">Next Payment Due</p>
                    <p className="text-base font-medium text-[#101828]">{formatDate(loanDetails.nextRepaymentDate)}</p>
                  </div>
                </div>
              </div>

              {/* Stage Management */}
              <div className="bg-white border border-[#EAECF0] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#101828] mb-4">Stage Management</h3>
                <div className="space-y-2">
                  {['inquiry', 'documentation', 'review', 'approval', 'disbursement'].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStageUpdate(stage)}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        loanDetails.stage === stage
                          ? 'bg-[#7F56D9] text-white'
                          : 'bg-gray-100 text-[#344054] hover:bg-gray-200'
                      }`}
                    >
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}