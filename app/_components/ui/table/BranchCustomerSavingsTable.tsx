import { ApiResponseError } from "@/app/types/auth";
import { Transactions } from "@/app/types/customer";
import { Meta } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import Pagination from "../Pagination";
import TableState from "./TableState";
import { formatCurrency } from "@/lib/utils";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: Transactions[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function BranchCustomerSavingsTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
}: TableProps) {
 

  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th>#</th>
            <th>Transaction Id</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date joined</th>
            
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={6}
            emptyMessage="No credit oficer data available yet!!"
          />

          {item?.map((saving, index) => {
            return (
              <tr key={saving.id}>
                <th>{index + 1}</th>
                <td>
                 Id: {saving.id}
                </td>
                <td>{saving.type}</td>
                <td>{formatCurrency(Number(saving.amount))}</td>
                <td>{saving.description}</td>
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
