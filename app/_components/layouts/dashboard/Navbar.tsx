import Image from "next/image";
import React, { JSX } from "react";
import ProfileDropdown from "../../ui/ProfileDropdown";
import logo from "@/public/logo.png";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Navbar(): JSX.Element {
  return (
    <nav 
      className="fixed top-0 left-0 z-40 flex items-center w-full bg-white"
      style={{
        height: '70px',
        maxWidth: '1440px',
        borderBottom: '0.2px solid #5A6880',
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Logo section - positioned at 2.29% from left */}
        <div 
          className="flex items-center gap-2"
          style={{
            marginLeft: '2.29%',
          }}
        >
          <label
            htmlFor="my-drawer-4"
            className="btn btn-square btn-ghost lg:hidden"
            aria-label="Open navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
              <path d="M9 4v16"></path>
              <path d="M14 10l2 2l-2 2"></path>
            </svg>
          </label>

          <div className="flex items-center">
            <Image height="40" src={logo} alt="Kaytop MI logo" />
            <span className="text-sm font-semibold sm:text-base md:text-lg">
              Kaytop MI
            </span>
          </div>
        </div>

        {/* User profile section */}
        <ProfileDropdown />
      </div>
    </nav>
  );
}
