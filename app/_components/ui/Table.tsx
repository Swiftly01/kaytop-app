"use client";

import React, { useState } from "react";
import { Checkbox } from "./Checkbox";
import { StatusBadge } from "./StatusBadge";
import { ArrowDownIcon } from "../icons/arrow-down-icon";
import { formatDate } from "@/lib/formatDate";

interface LoanRecord {
  id: string;
  loanId: string;
  name: string;
  status?: 'Active' | 'Scheduled';
  type?: 'Savings';
  interest?: string;
  amount: string;
  dateDisbursed: string | Date;
}

export interface BranchRecord {
  id: string;
  branchId: string;
  name: string;
  cos: string;
  customers: number;
  dateCreated: string | Date;
}

type TableType = 'disbursements' | 're-collections' | 'savings' | 'missed-payments' | 'branches';

interface TableProps {
  data?: LoanRecord[] | BranchRecord[];
  tableType?: TableType;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Default data for backwards compatibility
const defaultLoanData: LoanRecord[] = [
  { id: '1', loanId: '43756', name: 'Ademola Jumoke', status: 'Active', interest: '7.25%', amount: 'NGN87,000', dateDisbursed: '2024-06-03' },
  { id: '2', loanId: '45173', name: 'Adegboyoga Precious', status: 'Active', interest: '6.50%', amount: 'NGN55,000', dateDisbursed: '2023-12-24' },
  { id: '3', loanId: '70668', name: 'Nneka Chukwu', status: 'Scheduled', interest: '8.00%', amount: 'NGN92,000', dateDisbursed: '2024-11-11' },
  { id: '4', loanId: '87174', name: 'Damilare Usman', status: 'Active', interest: '7.75%', amount: 'NGN68,000', dateDisbursed: '2024-02-02' },
  { id: '5', loanId: '89636', name: 'Jide Kosoko', status: 'Active', interest: '7.00%', amount: 'NGN79,000', dateDisbursed: '2023-08-18' },
  { id: '6', loanId: '97174', name: 'Oladejo israel', status: 'Active', interest: '6.75%', amount: 'NGN46,000', dateDisbursed: '2024-09-09' },
  { id: '7', loanId: '22739', name: 'Eze Chinedu', status: 'Active', interest: '8.25%', amount: 'NGN61,000', dateDisbursed: '2023-07-27' },
  { id: '8', loanId: '22739', name: 'Adebanji Bolaji', status: 'Active', interest: '7.50%', amount: 'NGN73,000', dateDisbursed: '2024-04-05' },
  { id: '9', loanId: '48755', name: 'Baba Kaothat', status: 'Active', interest: '6.25%', amount: 'NGN62,000', dateDisbursed: '2023-10-14' },
  { id: '10', loanId: '30635', name: 'Adebayo Salami', status: 'Active', interest: '7.10%', amount: 'NGN84,000', dateDisbursed: '2024-03-22' },
];

export default function Table({ data = defaultLoanData, tableType = 'disbursements', onSelectionChange }: TableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);

  // Column configurations for different table types
  const getColumnConfig = () => {
    switch (tableType) {
      case 'branches':
        return {
          showInterest: false,
          showType: false,
          showDate: true,
          showActions: false,
          showStatus: false,
          isBranchTable: true,
          amountLabel: 'Customers',
          dateLabel: 'Date Created',
          ariaLabel: 'Branches table',
          columns: {
            branchId: { width: '165px', label: 'Branch ID' },
            name: { width: '221px', label: 'Name' },
            cos: { width: '162px', label: "CO's" },
            customers: { width: '162px', label: 'Customers' },
            dateCreated: { width: '197px', label: 'Date Created' }
          }
        };
      case 're-collections':
        return {
          showInterest: false,
          showType: false,
          showDate: true,
          showActions: false,
          showStatus: true,
          isBranchTable: false,
          amountLabel: 'Amount to be paid',
          dateLabel: 'Date to be paid',
          ariaLabel: 'Loan re-collections table'
        };
      case 'savings':
        return {
          showInterest: false,
          showType: true,
          showDate: true,
          showActions: false,
          showStatus: false,
          isBranchTable: false,
          amountLabel: 'Amount saved',
          dateLabel: 'Date to be paid',
          ariaLabel: 'Savings table'
        };
      case 'missed-payments':
        return {
          showInterest: true,
          showType: false,
          showDate: false,
          showActions: true,
          showStatus: true,
          isBranchTable: false,
          amountLabel: 'Amount',
          dateLabel: 'Date',
          ariaLabel: 'Missed payments table'
        };
      case 'disbursements':
      default:
        return {
          showInterest: true,
          showType: false,
          showDate: true,
          showActions: false,
          showStatus: true,
          isBranchTable: false,
          amountLabel: 'Amount',
          dateLabel: 'Date disbursed',
          ariaLabel: 'Loan disbursements table'
        };
    }
  };

  const columnConfig = getColumnConfig();

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? data.map(item => item.id) : [];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedRows, id]
      : selectedRows.filter(rowId => rowId !== id);
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = (loan: LoanRecord) => {
    setSelectedLoan(loan);
    setDeleteModalOpen(true);
  };

  const handleEdit = (loan: LoanRecord) => {
    setSelectedLoan(loan);
    setEditModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLoan) {
      console.log('Deleting loan:', selectedLoan.loanId);
      // TODO: Implement actual delete logic with API call
      // Example: await deleteLoan(selectedLoan.id);
      setDeleteModalOpen(false);
      setSelectedLoan(null);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLoan) {
      console.log('Updating loan:', selectedLoan);
      // TODO: Implement actual update logic with API call
      // Example: await updateLoan(selectedLoan.id, updatedData);
      setEditModalOpen(false);
      setSelectedLoan(null);
    }
  };

  // Sort data based on status or type column
  const sortedData = [...data].sort((a, b) => {
    if (columnConfig.isBranchTable) {
      // No sorting for branches table yet
      return 0;
    }
    
    const loanA = a as LoanRecord;
    const loanB = b as LoanRecord;
    const aValue = columnConfig.showType ? (loanA.type || '') : (loanA.status || '');
    const bValue = columnConfig.showType ? (loanB.type || '') : (loanB.status || '');
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const allSelected = selectedRows.length === data.length && data.length > 0;

  return (
    <div 
      className="w-full max-w-[1041px] bg-white rounded-[4px] border border-[#EAECF0]"
      role="region"
      aria-label={columnConfig.ariaLabel}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="h-[44px] bg-[#F9FAFB] border-b border-[#EAECF0]">
              <th className="w-[48px] text-left pl-6 pr-3" scope="col">
                <div className="flex items-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label={columnConfig.isBranchTable ? "Select all branches" : "Select all loans"}
                  />
                </div>
              </th>
              {columnConfig.isBranchTable ? (
                <>
                  <th className="w-[140px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                    Branch ID
                  </th>
                  <th className="w-[200px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                    Name
                  </th>
                  <th className="w-[140px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                    CO's
                  </th>
                  <th className="w-[140px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                    Customers
                  </th>
                  <th className="w-[180px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                    Date Created
                  </th>
                </>
              ) : (
                <>
                  <th className="w-[140px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                    Loan ID
                  </th>
                  {columnConfig.showType ? (
                    <>
                      <th className="w-[140px] text-left px-3" scope="col" aria-sort={sortDirection === 'asc' ? 'ascending' : 'descending'}>
                        <button
                          onClick={handleSort}
                          className="flex items-center gap-1 text-xs font-medium text-[#475467] hover:text-[#344054] active:text-[#1D2939] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 rounded px-1 py-0.5"
                          aria-label={`Sort by type ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                        >
                          Type
                          <ArrowDownIcon 
                            className={`w-4 h-4 transition-transform duration-200 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                            color="#475467"
                            aria-hidden="true"
                          />
                        </button>
                      </th>
                      <th className="w-[200px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                        Name
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="w-[200px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                        Name
                      </th>
                      {columnConfig.showStatus && (
                        <th className="w-[140px] text-left px-3" scope="col" aria-sort={sortDirection === 'asc' ? 'ascending' : 'descending'}>
                          <button
                            onClick={handleSort}
                            className="flex items-center gap-1 text-xs font-medium text-[#475467] hover:text-[#344054] active:text-[#1D2939] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 rounded px-1 py-0.5"
                            aria-label={`Sort by status ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                          >
                            Status
                            <ArrowDownIcon 
                              className={`w-4 h-4 transition-transform duration-200 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                              color="#475467"
                              aria-hidden="true"
                            />
                          </button>
                        </th>
                      )}
                    </>
                  )}
                  {columnConfig.showInterest && (
                    <th className="w-[120px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                      Interest
                    </th>
                  )}
                  <th className={`${columnConfig.showInterest ? 'w-[140px]' : 'w-[180px]'} text-left px-3 text-xs font-medium text-[#475467]`} scope="col">
                    {columnConfig.amountLabel}
                  </th>
                  {columnConfig.showDate && (
                    <th className={`${columnConfig.showInterest ? 'w-[180px]' : 'w-[220px]'} text-left px-3 text-xs font-medium text-[#475467]`} scope="col">
                      {columnConfig.dateLabel}
                    </th>
                  )}
                  {columnConfig.showActions && (
                    <th className="w-[100px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                      Actions
                    </th>
                  )}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => {
              const isSelected = selectedRows.includes(item.id);
              const isBranch = columnConfig.isBranchTable;
              const branch = isBranch ? (item as BranchRecord) : null;
              const loan = !isBranch ? (item as LoanRecord) : null;
              
              return (
              <tr
                key={item.id}
                className={`h-[72px] border-b border-[#EAECF0] transition-colors ${
                  isSelected 
                    ? 'bg-[#F9F5FF] hover:bg-[#F4EBFF]' 
                    : 'hover:bg-gray-50'
                }`}
                aria-selected={isSelected}
              >
                <td className="pl-6 pr-3">
                  <Checkbox
                    checked={selectedRows.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                    aria-label={isBranch 
                      ? `Select branch ${branch?.branchId} - ${branch?.name}`
                      : `Select loan ${loan?.loanId} for ${loan?.name}`
                    }
                  />
                </td>
                {isBranch && branch ? (
                  <>
                    <td className="px-3 text-sm font-normal text-[#475467]">
                      {branch.branchId}
                    </td>
                    <td className="px-3 text-sm font-medium text-[#101828]">
                      {branch.name}
                    </td>
                    <td className="px-3 text-sm font-normal text-[#475467]">
                      {branch.cos}
                    </td>
                    <td className="px-3 text-sm font-normal text-[#475467]">
                      {branch.customers}
                    </td>
                    <td className="px-3 text-sm font-normal text-[#475467]">
                      {formatDate(branch.dateCreated)}
                    </td>
                  </>
                ) : loan && (
                  <>
                    <td className="px-3 text-sm font-normal text-[#475467]">
                      {loan.loanId}
                    </td>
                    {columnConfig.showType ? (
                      <>
                        <td className="px-3">
                          <StatusBadge status="Savings" type="savings" />
                        </td>
                        <td className="px-3 text-sm font-medium text-[#101828]">
                          {loan.name}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 text-sm font-medium text-[#101828]">
                          {loan.name}
                        </td>
                        {columnConfig.showStatus && (
                          <td className="px-3">
                            <StatusBadge status={loan.status || 'Active'} />
                          </td>
                        )}
                      </>
                    )}
                    {columnConfig.showInterest && (
                      <td className="px-3 text-sm font-normal text-[#475467]">
                        {loan.interest}
                      </td>
                    )}
                    <td className="px-3 text-sm font-normal text-[#475467]">
                      {loan.amount}
                    </td>
                    {columnConfig.showDate && (
                      <td className="px-3 text-sm font-normal text-[#475467]">
                        {formatDate(loan.dateDisbursed)}
                      </td>
                    )}
                    {columnConfig.showActions && (
                      <td className="px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(loan)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label={`Delete loan ${loan.loanId}`}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.3333 5V4.33333C13.3333 3.39991 13.3333 2.9332 13.1517 2.57668C12.9919 2.26308 12.7369 2.00811 12.4233 1.84832C12.0668 1.66667 11.6001 1.66667 10.6667 1.66667H9.33333C8.39991 1.66667 7.9332 1.66667 7.57668 1.84832C7.26308 2.00811 7.00811 2.26308 6.84832 2.57668C6.66667 2.9332 6.66667 3.39991 6.66667 4.33333V5M8.33333 9.58333V13.75M11.6667 9.58333V13.75M2.5 5H17.5M15.8333 5V14.3333C15.8333 15.7335 15.8333 16.4335 15.5608 16.9683C15.3212 17.4387 14.9387 17.8212 14.4683 18.0608C13.9335 18.3333 13.2335 18.3333 11.8333 18.3333H8.16667C6.76654 18.3333 6.06647 18.3333 5.53169 18.0608C5.06129 17.8212 4.67883 17.4387 4.43915 16.9683C4.16667 16.4335 4.16667 15.7335 4.16667 14.3333V5" stroke="#475467" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(loan)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label={`Edit loan ${loan.loanId}`}
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14.1667 2.49993C14.3856 2.28106 14.6454 2.10744 14.9314 1.98899C15.2173 1.87054 15.5238 1.80957 15.8334 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5 2.49993C17.7189 2.7188 17.8925 2.97863 18.011 3.2646C18.1294 3.55057 18.1904 3.85706 18.1904 4.16659C18.1904 4.47612 18.1294 4.78262 18.011 5.06859C17.8925 5.35455 17.7189 5.61439 17.5 5.83326L6.25002 17.0833L1.66669 18.3333L2.91669 13.7499L14.1667 2.49993Z" stroke="#475467" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#101828] mb-2">Delete Loan</h3>
            <p className="text-sm text-[#475467] mb-6">
              Are you sure you want to delete loan <span className="font-medium">#{selectedLoan.loanId}</span> for <span className="font-medium">{selectedLoan.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedLoan(null);
                }}
                className="px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-[#E43535] rounded-lg hover:bg-[#C92A2A] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#101828] mb-4">Edit Loan</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    Loan ID
                  </label>
                  <input
                    type="text"
                    value={selectedLoan.loanId}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, loanId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedLoan.name}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={selectedLoan.amount}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                  />
                </div>
                {selectedLoan.interest && (
                  <div>
                    <label className="block text-sm font-medium text-[#344054] mb-1">
                      Interest
                    </label>
                    <input
                      type="text"
                      value={selectedLoan.interest}
                      onChange={(e) => setSelectedLoan({ ...selectedLoan, interest: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    Status
                  </label>
                  <select
                    value={selectedLoan.status || 'Active'}
                    onChange={(e) => setSelectedLoan({ ...selectedLoan, status: e.target.value as 'Active' | 'Scheduled' })}
                    className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedLoan(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
