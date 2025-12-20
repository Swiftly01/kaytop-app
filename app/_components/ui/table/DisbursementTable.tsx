import React, { JSX } from "react";
import Pagination from "../Pagination";
import { LoanDisbursedItem, Meta } from "@/app/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import Badge from "../Badge";

interface TableProps {
  item?: LoanDisbursedItem[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function DisbursementTable({
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
            <th>Amount</th>
            <th>Intrest</th>
            <th>Date Disbursed</th>
          </tr>
        </thead>
        <tbody>
          {item?.map((loan, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>ID: Loan{index + 1}</td>
                <td>{loan.name}</td>
                <td><Badge badge={loan.status}/></td>
                <td>{formatCurrency(loan.amount)}</td>
                <td>{formatCurrency(loan.interest)}</td>
                <td>{formatDate(loan.dateDisbursed)}</td>
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
