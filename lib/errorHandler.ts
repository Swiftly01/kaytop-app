import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import validationError from "./validationError";
import { ValidationErrorResponse } from "@/app/types/auth";
import { FieldError } from "react-hook-form";

export function handleAxiosError<TField extends string>(
  error: AxiosError,
  setError?: (field: TField, error: FieldError) => void
) {
  //Network error
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK")
      return toast.error(
        "Network error. Please check your connection or server."
      );
  }

  //Server responded with a status code
  if (error.response) {
    const status = error.response?.status;

    // Validation error 422
    if (status === 422) {
      const data = error.response.data as ValidationErrorResponse;

      if (data.errors) {
        if (!setError) {
          console.warn("setError missing for validation errors");
          return toast.error("Validation failed");
        }

        validationError<TField>(data.errors, setError);

        return toast.error("Validation error. Please check your input");
      }
    }

    //400-499 client errors
    if (status >= 400 && status < 500) {
      const data = error.response.data as ValidationErrorResponse;

      const message = data.message || "Request failed";
      return toast.error(message);
    }

    // 500+ Server errors
    if (status >= 500) {
      return toast.error("Server error. Please try again later.");
    }

    //No response from server
    if (error.request) {
      return toast.error("No response from server. Please try again");
    }
  }

  //fallback
  console.error(error);
  return toast.error("Unexpected error occured");
}
