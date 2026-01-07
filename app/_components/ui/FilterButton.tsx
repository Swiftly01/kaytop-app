import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export default function FilterButton({
  children,
  className = "",
  active = false,
  disabled = false,
  ...props
}: ButtonProps) {
  const base = "px-2 py-0.5 font-medium rounded-sm  text-md transition-all";

  const activeStyles = "bg-brand-purple text-white";
  const inactiveStyles =
    "bg-white text-neutral-700 hover:bg-brand-purple hover:text-white";
  const disabledStyles = disabled ? "cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      disabled={disabled}
      {...props}
      className={`${base} ${
        active ? activeStyles : inactiveStyles
      } ${className} ${disabledStyles}`}
    >
      {children}
    </button>
  );
}
