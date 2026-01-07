import { TableStateProps } from "@/app/types/dashboard";
import SpinnerLg from "../SpinnerLg";
import ErrorMessage from "./ErrorMessage";

export default function TableState({
  isLoading,
  error,
  isEmpty,
  colSpan,
  emptyMessage = "No data available",
}: TableStateProps) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={colSpan}>
          <div className="flex items-center justify-center">
            <SpinnerLg />
          </div>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={colSpan}>
          <ErrorMessage error={error} />
        </td>
      </tr>
    );
  }

  if (isEmpty) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center text-gray-500">
          {emptyMessage}
        </td>
      </tr>
    );
  }

  return null;
}
