import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function FilterButton({
  children,
  className = "",
  active = false,
  ...props
}: ButtonProps) {
  
  const base =
    "px-2 py-0.5 font-medium rounded-sm cursor-pointer text-md transition-all";

  const activeStyles = "bg-brand-purple text-white";
  const inactiveStyles =
    "bg-white text-neutral-700 hover:bg-brand-purple hover:text-white";
  return (
    <button
      {...props}
      className={`${base} ${
        active ? activeStyles : inactiveStyles
      } ${className}`}
    >
      {children}
    </button>
  );
}
