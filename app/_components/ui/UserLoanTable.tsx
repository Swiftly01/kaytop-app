import { ApiResponseError } from "@/app/types/auth";
import { Meta } from "@/app/types/dashboard";
import { BaseLoanData } from "@/app/types/loan";
import { formatCurrency } from "@/lib/utils";
import { AxiosError } from "axios";
import TableState from "./table/TableState";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Pagination from "./Pagination";
import { StatusBadge } from "@/app/dashboard/agent/loans/LoanAgentClient";


interface UserLoanTableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: BaseLoanData[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
  onView: (loanId: number) => void;

}


export default function UserLoanTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
  onView,
}: UserLoanTableProps) {
  
  return (
    <div className="overflow-x-auto p-2">
      <table className="table table-md text-sm">
        <thead className="bg-slate-50 text-slate-500 ">
            <tr>
              <th className="p-4">
                <input type="checkbox" />
              </th>
              <th className="text-left p-4">Loan ID</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Interest</th>
              <th className="text-left p-4">Next Repayment</th>
              <th className="p-4"></th>
            </tr>
          </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={7}
            emptyMessage="No loan records available yet!!"
          />

          {item?.map((loan, index) => {
            return (
               <tr key={loan.id} className="border-t text-nowrap">
                <td className="p-4">
                   <input
                    type="checkbox"
                    onClick={() => onView(loan.id)}
                    />
                </td>
                <td
                className="p-4 text-slate-500 cursor-pointer"
                onClick={() => onView(loan.id)}
                >
                {loan.loanId}
                </td>

                <td className="p-4 font-medium">{loan.customerName}</td>
                <td className="p-4">
                  <StatusBadge status={loan.status.toUpperCase()} />
                </td>
                <td className="p-4">{`NGN${loan.amount}`}</td>
                <td className="p-4">{loan.interestRate}%</td>
                <td className="p-4"> {loan?.dueDate
                    ? new Date(loan.dueDate).toDateString()
                    : "—"}</td>
                {/* <td className="p-4 flex gap-3 justify-end">
                  <Trash2 size={16} className="text-slate-400 cursor-pointer" />
                  <Pencil size={16} className="text-slate-400 cursor-pointer" />
                </td> */}
              </tr>
            );
          })}
        </tbody>
      </table>
      {meta && onPageChange && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
