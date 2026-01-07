import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { nestValidationError, validationError } from "./validationMapper";
import { NestValidationErrorResponse, ValidationErrorResponse } from "@/app/types/auth";
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

      if (data.errors && setError) {
        validationError<TField>(data.errors, setError);

        return toast.error("Validation error. Please check your input");
      }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if(status === 400 && Array.isArray((error.response.data as any)?.message)){

      if(!setError){
        return toast.error("Validation failed")
      }

      const data = error.response.data as NestValidationErrorResponse;
      nestValidationError<TField>(data.message, setError)
        return toast.error("Validation error. Please check your input");

    }

      // Other client errors
    if (status >= 400 && status < 500) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = error.response.data as any;
      return toast.error(data.message || "Request failed");
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
