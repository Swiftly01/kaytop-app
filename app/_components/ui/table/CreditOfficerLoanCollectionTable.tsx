import {
  Collections,
  CreditOfficerErrorResponse,
} from "@/app/types/creditOfficer";
import { Meta } from "@/app/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import SpinnerLg from "../SpinnerLg";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<CreditOfficerErrorResponse> | null;
  item?: Collections[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function CreditOfficerLoanCollectionTable({
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
            <th>Transaction ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
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
              <td colSpan={7}>
                No Loan data available for this Credit officer
              </td>
            </tr>
          )}

          {item?.map((collection, index) => {
            return (
              <tr key={collection.id}>
                <td>{index + 1}</td>
                <td>ID Loan{collection.id}</td>
                <td>{collection.collectionType}</td>
                <td>{formatCurrency(Number(collection.amount))}</td>
                <td>{collection.loanDetails?.loanStatus ?? "N/A"}</td>
                <td>{formatDate(collection.paymentDate)}</td>
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
