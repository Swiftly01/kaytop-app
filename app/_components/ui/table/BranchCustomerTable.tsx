import { ApiResponseError } from "@/app/types/auth";
import { CustomerData } from "@/app/types/customer";
import { Meta } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import Link from "next/link";
import Pagination from "../Pagination";
import TableState from "./TableState";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: CustomerData[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function BranchCustomerTable({
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
            <th>Name</th>
            <th>Branch</th>
            <th>Phone number</th>
            <th>Email</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && item?.length === 0}
            colSpan={7}
            emptyMessage="No credit oficer data available yet!!"
          />

          {item?.map((customer, index) => {
            return (
              <tr key={customer.id}>
                <th>{index + 1}</th>
                <td>
                  {customer.firstName} {customer.lastName}
                </td>
                <td>{customer.branch}</td>
                <td>{customer.mobileNumber}</td>
                <td>{customer.email}</td>
                <td>{customer.state}</td>
                <td>
                  <Link href={`/dashboard/bm/customer/details/${customer.id}`}>
                    <img
                      className="w-4 cursor-pointer"
                      src="/view.svg"
                      alt="view icon"
                    />
                  </Link>
                </td>
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
