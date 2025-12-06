"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="flex items-center gap-3"
      style={{
        marginRight: 'calc(100% - 96.25%)', // Position dropdown arrow at 96.25% from left
      }}
    >
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger 
          className="flex items-center gap-3 transition outline-none cursor-pointer hover:opacity-80 focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 rounded-md"
          aria-label="User menu"
        >
          {/* User name - positioned at 78.75% from left, 34.29% from top */}
          <span 
            className="font-open-sauce-sans text-right"
            style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            Lanre Okedele
          </span>

          {/* User avatar - 29x29px circle, positioned at 86.88% from left */}
          <Avatar 
            style={{
              width: '29px',
              height: '29px',
            }}
          >
            <AvatarImage src="/avatar.svg" alt="Lanre Okedele profile picture" />
            <AvatarFallback>LO</AvatarFallback>
          </Avatar>

          {/* Dropdown arrow - 14x14px, positioned at 96.25% from left */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            aria-hidden="true"
          >
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>

          <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 cursor-pointer">Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
