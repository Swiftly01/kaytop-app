import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "border bg-transparent text-base rounded-md px-3 py-1 w-full h-10 my-2",
        "focus:outline-none focus:ring-2 focus:ring-[#BCC7D3]", // <-- your focus
        className
      )}
      {...props}
    />
  );
}

export { Input };
