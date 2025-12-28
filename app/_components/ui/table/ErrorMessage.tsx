import { ApiResponseError } from "@/app/types/auth";
import { AxiosError } from "axios";

interface ErrorMessageProps {
  error: AxiosError<ApiResponseError> | null;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  const message =
    error.response?.data.message ?? error.message ?? "Something went wrong";

  return <p className="text-center text-red-400">{message}</p>;
}
