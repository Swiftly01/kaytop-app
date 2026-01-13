import { ApiResponseError } from "@/app/types/auth";
import { CustomerData } from "@/app/types/customer";
import { Meta } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TableState from "./table/TableState";
import { Pencil, Trash2 } from "lucide-react";
import Pagination from "./Pagination";

interface TableProps {
  isLoading: boolean;
  error: AxiosError<ApiResponseError> | null;
  item?: CustomerData[];
  meta?: Meta;
  onPageChange?: (page: number) => void;
}

export function CustomerTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
}: TableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const goToCustomer = (id: number) => {
    router.push(`/dashboard/agent/customer/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-md text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4">
              <input type="checkbox" />
            </th>
            <th className="p-4">Name</th>
            <th className="p-4">Status</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Email</th>
            <th className="p-4">Date Joined</th>
            <th className="p-4" />
          </tr>
        </thead>

        <tbody>
          <TableState
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !item?.length}
            colSpan={7}
            emptyMessage="No customer data available yet"
          />

          {item?.map((c) => (
            <tr key={c.id} className="border-t hover:bg-gray-50">
              <td onClick={() => goToCustomer(c.id)}   className="p-4">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() => toggle(c.id)}
                />
              </td>

              <td
                className="p-4 font-medium cursor-pointer"
                onClick={() => goToCustomer(c.id)}
              >
                {c.firstName} {c.lastName}
                <div className="text-xs text-gray-400">ID: {c.id}</div>
              </td>

              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    c?.verificationStatus === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {c?.verificationStatus || "Active"}
                </span>
              </td>

              <td className="p-4">{c.mobileNumber}</td>
              <td className="p-4">{c.email}</td>
              <td className="p-4 text-center">{c?.createdAt
                    ? new Date(c.createdAt).toDateString()
                    : "—"}</td>

              <td className="p-4 flex gap-3">
                <Trash2 size={16} />
                <Pencil size={16} />
              </td>
            </tr>
          ))}
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
