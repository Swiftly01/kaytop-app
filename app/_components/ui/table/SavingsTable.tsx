import React, { JSX } from "react";
import Pagination from "../Pagination";
import {  Meta, Savings } from "@/app/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface TableProps {
  item?: Savings[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function SavingsTable({
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
          {item?.map((saving, index) => {
            return (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>ID: Loan{index + 1}</td>
                <td>{saving.user.firstName}</td>
                <td>savings</td>
                <td>{formatCurrency(saving.balance)}</td>
                <td>{saving.createdAt}</td>
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
