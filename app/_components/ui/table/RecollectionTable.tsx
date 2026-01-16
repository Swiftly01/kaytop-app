import { LoanRecollectionItem, Meta } from "@/app/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { JSX } from "react";
import Pagination from "../Pagination";
import Badge from "../Badge";
import { ApiResponseError } from "@/app/types/auth";
import { AxiosError } from "axios";
import TableState from "./TableState";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: LoanRecollectionItem[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function RecollectionTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
}: TableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Loan ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Amount to be paid</th>
            <th>Date to be paid</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={6}
            emptyMessage="No loan recollection data available yet!!"
          />

          {item?.map((loan, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>ID: Loan{index + 1}</td>
                <td>{loan.name}</td>
                <td>
                  {" "}
                  <Badge badge={loan.status} />
                </td>
                <td>{formatCurrency(loan.amountToBePaid)}</td>
                <td>{formatDate(loan.dateToBePaid)}</td>
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
