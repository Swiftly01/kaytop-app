import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "tertiary" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset" ;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const variants = {
  primary: "bg-primary-300 text-primary hover:text-white font-medium",
  secondary: "bg-brand-secondary text-brand-purple hover:text-white font-medium",
  tertiary: "bg-brand-purple text-white hover:text-white font-medium",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizes = {
  sm: "px-4 py-1.5",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "submit",
  fullWidth = false,
  className = "",
  onClick,
  loading = false,
  disabled = false,
  // type = "button", // default type
  ...props
}: ButtonProps) {
  const isDisabled = disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer";
  return (
    <button
      {...props}
      onClick={onClick}
      className={`relative  rounded-md 
                       overflow-hidden transition-all duration-300
                       before:content-[''] before:absolute before:top-0 before:left-0
                       before:w-0 before:h-full before:bg-white/30
                       before:transition-all before:duration-300
                       hover:before:w-full  
                       ${variants[variant]}
                       ${sizes[size]}
                       ${fullWidth ? "w-full" : ""}
                       ${className}
                       ${isDisabled}
                       
                       `}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}