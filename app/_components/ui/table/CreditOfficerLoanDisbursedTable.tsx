import {
  CreditOfficerErrorResponse,
  Loan
} from "@/app/types/creditOfficer";
import { Meta } from "@/app/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import SpinnerLg from "../SpinnerLg";
import Badge from "../Badge";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<CreditOfficerErrorResponse> | null;
  item?: Loan[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function CreditOfficerLoanDisbursedTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
}: TableProps) {
  if (error) {
    return (
      <p className="text-center text-red-400">{error.response?.data.message}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Loan ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Intrest</th>
            <th>Disbursement Date</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={7}>
                <div className="flex items-center justify-center">
                  <SpinnerLg />
                </div>
              </td>
            </tr>
          )}

          {!isLoading && item?.length === 0 && (
            <tr>
              <td colSpan={7}>No Loan data available for this Credit officer</td>
            </tr>
          )}

          {item?.map((loan, index) => {
            return (
              <tr key={loan.id}>
                <td>{index + 1}</td>
                <td>ID Loan{loan.id}</td>
                <td>
                  {loan.customerName}
                </td>
                <td><Badge badge="pending" /> </td>
                <td>{formatCurrency(Number(loan.principal))}</td>
                <td>{formatCurrency(Number(loan.interestRate))}</td>
                <td>{formatDate(loan.disbursementDate)}</td>
                
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
