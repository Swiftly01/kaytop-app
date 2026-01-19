import React from 'react';

interface SavingsIconProps {
  className?: string;
  color?: string;
}

export function SavingsIcon({ className = '', color = '#888F9B' }: SavingsIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.16751 14.8325 1.25 10 1.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 8.125C7.5 7.43464 8.05964 6.875 8.75 6.875H11.25C11.9404 6.875 12.5 7.43464 12.5 8.125C12.5 8.81536 11.9404 9.375 11.25 9.375H8.75C8.05964 9.375 7.5 9.93464 7.5 10.625C7.5 11.3154 8.05964 11.875 8.75 11.875H11.25C11.9404 11.875 12.5 12.4346 12.5 13.125C12.5 13.8154 11.9404 14.375 11.25 14.375H8.75C8.05964 14.375 7.5 13.8154 7.5 13.125"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5V6.875"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14.375V16.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}