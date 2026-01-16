import React, { JSX } from "react";
import Pagination from "../Pagination";
import { Meta, Savings } from "@/app/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AxiosError } from "axios";
import { ApiResponseError } from "@/app/types/auth";
import TableState from "./TableState";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: Savings[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function SavingsTable({
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
            <th>Type</th>
            <th>Amount saved</th>
            <th>Date saved</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={6}
            emptyMessage="No savings data available yet!!"
          />
          {item?.map((saving, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>ID: Loan{index + 1}</td>
                <td>{saving.user.firstName}</td>
                <td>savings</td>
                <td>{formatCurrency(saving.balance)}</td>
                <td>{formatDate(saving.createdAt)}</td>
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
