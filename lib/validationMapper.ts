import { BackendValidationErrors } from "@/app/types/auth";
import { FieldError } from "react-hook-form";

export function validationError<TField extends string>(
  backendErrors: BackendValidationErrors,
  setError: (field: TField, error: FieldError) => void
) {
  Object.entries(backendErrors).forEach(([field, messages]) => {
    const message = Array.isArray(messages) ? messages.join(", ") : messages;

    setError(field as TField, {
      type: "server",
      message,
    });
  });
}

export function nestValidationError<TField extends string>(
  messages: string[],
  setError: (field: TField, error: FieldError) => void
) {
  messages.forEach((msg) => {
    const field = msg.split(" ")[0];

    setError(field as TField, {
      type: "server",
      message: msg,
    });
  });
}
