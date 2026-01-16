import * as React from "react";

import { cn } from "@/lib/utils";

export default function Input({ className, type, disabled, ...props }: React.ComponentProps<"input">) {
  const isDisabled = disabled ? "cursor-not-allowed bg-gray-100" : "";
  
  // Add appropriate autocomplete attributes
  const getAutocomplete = () => {
    if (type === "email") return "email";
    if (type === "password") return "current-password";
    return "off";
  };
  
  return (
    <input
      type={type}
      autoComplete={getAutocomplete()}
      className={cn(
        "border bg-transparent text-base rounded-md px-3 py-1 w-full h-10 my-2",
        "focus:outline-none focus:ring-2 focus:ring-[#BCC7D3]", 
        className,
        isDisabled
      )}
     
      {...props}
    />
  );
}


