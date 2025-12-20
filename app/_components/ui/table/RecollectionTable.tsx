import { LoanRecollectionItem, Meta } from "@/app/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { JSX } from "react";
import Pagination from "../Pagination";
import Badge from "../Badge";

interface TableProps {
  item?: LoanRecollectionItem[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function RecollectionTable({
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
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
