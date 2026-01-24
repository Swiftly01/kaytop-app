import React, { JSX } from "react";
import Pagination from "../Pagination";
import { Meta, MissedPayment } from "@/app/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import Badge from "../Badge";
import { ApiResponseError } from "@/app/types/auth";
import { AxiosError } from "axios";
import TableState from "./TableState";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: MissedPayment[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function MissedPaymentTable({
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
            <th>Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Days missed</th>
            <th>Intrest</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={6}
            emptyMessage="No missed payment data available yet!!"
          />
          {item?.map((missedPayment, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{missedPayment.name}</td>
                <td>
                  {" "}
                  <Badge badge="scheduled" />
                </td>
                <td>{formatCurrency(missedPayment.amountOwedToday)}</td>
                <td>{missedPayment.missedDays} days</td>
                <td>{missedPayment.interest}%</td>
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
