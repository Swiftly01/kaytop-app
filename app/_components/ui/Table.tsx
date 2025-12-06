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
  status: 'Active' | 'Scheduled';
  interest: string;
  amount: string;
  dateDisbursed: string | Date;
}

interface TableProps {
  data?: LoanRecord[];
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

export default function Table({ data = defaultLoanData }: TableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map(loan => loan.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Sort data based on status column
  const sortedData = [...data].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.status.localeCompare(b.status);
    } else {
      return b.status.localeCompare(a.status);
    }
  });

  const allSelected = selectedRows.length === data.length && data.length > 0;

  return (
    <div 
      className="w-full max-w-[1041px] bg-white rounded-[4px] border border-[#EAECF0]"
      role="region"
      aria-label="Loan disbursements table"
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
                    aria-label="Select all loans"
                  />
                </div>
              </th>
              <th className="w-[140px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                Loan ID
              </th>
              <th className="w-[200px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                Name
              </th>
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
              <th className="w-[120px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                Interest
              </th>
              <th className="w-[140px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                Amount
              </th>
              <th className="w-[180px] text-left px-3 text-xs font-medium text-[#475467]" scope="col">
                Date disbursed
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((loan) => {
              const isSelected = selectedRows.includes(loan.id);
              return (
              <tr
                key={loan.id}
                className={`h-[72px] border-b border-[#EAECF0] transition-colors ${
                  isSelected 
                    ? 'bg-[#F9F5FF] hover:bg-[#F4EBFF]' 
                    : 'hover:bg-gray-50'
                }`}
                aria-selected={isSelected}
              >
                <td className="pl-6 pr-3">
                  <Checkbox
                    checked={selectedRows.includes(loan.id)}
                    onCheckedChange={(checked) => handleSelectRow(loan.id, checked as boolean)}
                    aria-label={`Select loan ${loan.loanId} for ${loan.name}`}
                  />
                </td>
                <td className="px-3 text-sm font-normal text-[#475467]">
                  {loan.loanId}
                </td>
                <td className="px-3 text-sm font-medium text-[#101828]">
                  {loan.name}
                </td>
                <td className="px-3">
                  <StatusBadge status={loan.status} />
                </td>
                <td className="px-3 text-sm font-normal text-[#475467]">
                  {loan.interest}
                </td>
                <td className="px-3 text-sm font-normal text-[#475467]">
                  {loan.amount}
                </td>
                <td className="px-3 text-sm font-normal text-[#475467]">
                  {formatDate(loan.dateDisbursed)}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
