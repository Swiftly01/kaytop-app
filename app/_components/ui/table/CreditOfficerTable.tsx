import {
  CreditOfficerData,
  CreditOfficerErrorResponse,
} from "@/app/types/creditOfficer";
import { Meta } from "@/app/types/dashboard";
import { formatDate } from "@/lib/utils";
import { AxiosError } from "axios";
import Link from "next/link";
import Pagination from "../Pagination";
import TableState from "./TableState";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<CreditOfficerErrorResponse> | null;
  item?: CreditOfficerData[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export default function CreditOfficerTable({
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
            <th>Email</th>
            <th>Created by</th>
            <th>Date joined</th>
            <th>Action</th>
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

          {item?.map((officer, index) => {
            return (
              <tr key={officer.id}>
                <th>{index + 1}</th>
                <td>
                  {officer.firstName} {officer.lastName}
                </td>
                <td>{officer.email}</td>
                <td>{officer.createdBy.firstName}</td>
                <td>{formatDate(officer.createdAt)}</td>
                <td>
                  <Link href={`/dashboard/bm/credit/officer/${officer.id}`}>
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
