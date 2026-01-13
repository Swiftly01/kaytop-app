import { ApiResponseError } from "@/app/types/auth";
import { Meta } from "@/app/types/dashboard";
import { BaseLoanData } from "@/app/types/loan";
import { formatCurrency } from "@/lib/utils";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import TableState from "./TableState";

interface LoanTableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: BaseLoanData[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
  onView: (loanId: number) => void;
  
  
  
}

export default function LoanTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
  onView,
}: LoanTableProps) {
  
  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Intrest</th>
            <th>Disbursement Date</th>
            <th>Action</th>
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
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{loan.customerName}</td>
                <td>{loan.status}</td>
                <td>{formatCurrency(Number(loan.amount))}</td>
                <td>{loan.interestRate}</td>
                <td>{loan.disbursementDate}</td>
                <td>
                  <label
                    onClick={() => onView(loan.id)}
                    htmlFor="my-drawer-5"
                    className="underline cursor-pointer drawer-button text-md decoration-brand-purple text-brand-purple"
                  >
                    <img
                      className="w-4 cursor-pointer"
                      src="/view.svg"
                      alt="view icon"
                    />
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {meta && onPageChange && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
