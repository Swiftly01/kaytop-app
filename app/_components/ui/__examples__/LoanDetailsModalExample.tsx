'use client';

import { useState } from 'react';
import { LoanDetailsModal, LoanDetailsData } from '../LoanDetailsModal';

/**
 * Example usage of the LoanDetailsModal component
 * 
 * This demonstrates how to integrate the modal into your application.
 */
export function LoanDetailsModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample loan data
  const sampleLoanData: LoanDetailsData = {
    reportId: 'BN-B1E73DA–0017',
    creditOfficer: 'James Alagbon',
    branch: 'Alagbon',
    loansDispursed: 25,
    loansValueDispursed: '₦2,500,000',
    savingsCollected: '₦450,000',
    repaymentsCollected: 18,
    dateSent: 'Jan 15, 2025',
    timeSent: '2:30 PM',
  };

  const handleApprove = () => {
    console.log('Loan approved:', sampleLoanData.reportId);
    // Add your approval logic here
    // e.g., API call, state update, toast notification
    setIsModalOpen(false);
  };

  const handleDecline = () => {
    console.log('Loan declined:', sampleLoanData.reportId);
    // Add your decline logic here
    // e.g., API call, state update, toast notification
    setIsModalOpen(false);
  };

  const handleClose = () => {
    console.log('Modal closed');
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Loan Details Modal Example</h1>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-[#7F56D9] text-white rounded-lg hover:bg-[#6941C6] transition-colors"
      >
        Open Loan Details Modal
      </button>

      <LoanDetailsModal
        isOpen={isModalOpen}
        onClose={handleClose}
        loanData={sampleLoanData}
        onApprove={handleApprove}
        onDecline={handleDecline}
      />

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Integration Notes:</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>The modal appears from the right side of the screen</li>
          <li>Click the backdrop or press Escape to close</li>
          <li>Focus is automatically managed for accessibility</li>
          <li>All data fields support N/A fallback for missing values</li>
          <li>Responsive design adapts to mobile screens</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example with dynamic data from an API or table row
 */
export function LoanDetailsModalWithDynamicData() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanDetailsData | null>(null);

  // Simulated loan reports data
  const loanReports: LoanDetailsData[] = [
    {
      reportId: 'BN-B1E73DA–0017',
      creditOfficer: 'James Alagbon',
      branch: 'Alagbon',
      loansDispursed: 25,
      loansValueDispursed: '₦2,500,000',
      savingsCollected: '₦450,000',
      repaymentsCollected: 18,
      dateSent: 'Jan 15, 2025',
      timeSent: '2:30 PM',
    },
    {
      reportId: 'BN-C2F84EB–0023',
      creditOfficer: 'Sarah Johnson',
      branch: 'Victoria Island',
      loansDispursed: 32,
      loansValueDispursed: '₦3,200,000',
      savingsCollected: '₦580,000',
      repaymentsCollected: 24,
      dateSent: 'Jan 16, 2025',
      timeSent: '10:15 AM',
    },
  ];

  const handleViewDetails = (loan: LoanDetailsData) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedLoan) {
      console.log('Approving loan:', selectedLoan.reportId);
      // Add approval logic here
    }
    setIsModalOpen(false);
  };

  const handleDecline = () => {
    if (selectedLoan) {
      console.log('Declining loan:', selectedLoan.reportId);
      // Add decline logic here
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Loan Reports</h1>
      
      <div className="space-y-4">
        {loanReports.map((loan) => (
          <div
            key={loan.reportId}
            className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{loan.reportId}</p>
              <p className="text-sm text-gray-600">{loan.creditOfficer} - {loan.branch}</p>
            </div>
            <button
              onClick={() => handleViewDetails(loan)}
              className="px-4 py-2 bg-[#7F56D9] text-white rounded-lg hover:bg-[#6941C6] transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedLoan && (
        <LoanDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          loanData={selectedLoan}
          onApprove={handleApprove}
          onDecline={handleDecline}
        />
      )}
    </div>
  );
}
