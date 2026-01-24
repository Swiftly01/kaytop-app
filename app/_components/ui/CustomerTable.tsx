import { ApiResponseError } from "@/app/types/auth";
import { CustomerData } from "@/app/types/customer";
import { Meta } from "@/app/types/dashboard";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TableState from "./table/TableState";
import { Pencil, Trash2 } from "lucide-react";
import Pagination from "./Pagination";
import DeleteCustomerModal from "@/app/dashboard/agent/customer/customers/DeleteCustomerModal";
import EditCustomerModal from "@/app/dashboard/agent/customer/customers/EditCustomerModal";
import {  useDeleteCustomer, useUpdateCustomer } from "@/app/hooks/useCustomers";

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

  const [editCustomer, setEditCustomer] = useState<CustomerData | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<CustomerData | null>(null);

  const [page, setPage] = useState(1);
  // const { data } = useCustomers(page);
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const handleEdit = (customer: CustomerData) => {
    setEditCustomer(customer);
  };

  const handleDelete = (customer: CustomerData) => {
    setDeleteCustomer(customer);
  };

  const handleSaveEdit = async (
    customerId: number,
    payload: { firstName: string; lastName: string }
  ) => {
    await updateMutation.mutateAsync({ userId: customerId, payload });
    setEditCustomer(null);
  };

  const handleConfirmDelete = async (customerId: number) => {
    await deleteMutation.mutateAsync(customerId);
    setDeleteCustomer(null);
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
            <tr key={c.id} className="border-t hover:bg-gray-50 text-nowrap">
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

              <td className="p-4" style={{ maxWidth: '150px' }}>
                <div className="truncate" title={c.mobileNumber}>
                  {c.mobileNumber}
                </div>
              </td>
              <td className="p-4" style={{ maxWidth: '200px' }}>
                <div className="truncate" title={c.email}>
                  {c.email}
                </div>
              </td>
              <td className="p-4 text-center">{c?.createdAt
                    ? new Date(c.createdAt).toDateString()
                    : "—"}</td>

              <td className="p-4 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(c);
                }}
                className="text-violet-600 hover:text-violet-800"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(c);
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
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

       {/* Edit Modal */}
        <EditCustomerModal
          isOpen={editCustomer !== null}
          onClose={() => setEditCustomer(null)}
          customer={editCustomer}
          onSave={handleSaveEdit}
        />

        {/* Delete Modal */}
        <DeleteCustomerModal
          isOpen={deleteCustomer !== null}
          onClose={() => setDeleteCustomer(null)}
          customer={deleteCustomer}
          onDelete={handleConfirmDelete}
        />
    </div>
  );
}
