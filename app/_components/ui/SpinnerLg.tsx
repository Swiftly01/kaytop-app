import { Spinner } from "@/components/ui/spinner";
import React from "react";

type Variants = "lg" | "md" | "sm";
interface SpinnerProps {
  size?: Variants;
}

export default function SpinnerLg({ size = "lg" }: SpinnerProps) {
  const sizeMap: Record<Variants, string> = {
    lg: "size-10",
    md: "size-6",
    sm: "size-4",
  };

  return <Spinner className={`${sizeMap[size]} text-brand-purple`} />;
}
