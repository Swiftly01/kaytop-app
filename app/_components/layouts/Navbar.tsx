"use client";
import Link from "next/link";
import { JSX, useState } from "react";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import { ROUTES } from "@/lib/utils";

export default function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className=" relative p-3 text-primary-500 bg-white md:flex md:justify-between md:items-center border-b border-b-[#F2F4F7]">
      <div className="container flex items-center justify-between mx-auto">
        <Logo />

        <div className="flex items-center md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="cursor-pointer"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        <div className="items-center hidden gap-6 text-lg font-semibold md:flex text-primary">
          <Link
            href="/"
            className="relative hover:text-accent transition-colors duration-300
                       after:content-[''] after:absolute after:left-0 after:bottom-0
                       after:w-0 after:h-[2px] after:bg-primary-300
                       after:transition-all after:duration-300 hover:after:w-full"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="relative hover:text-primary-300 transition-colors duration-300
                       after:content-[''] after:absolute after:left-0 after:bottom-0
                       after:w-0 after:h-[2px] after:bg-primary-300
                       after:transition-all after:duration-300 hover:after:w-full"
          >
            Contact
          </Link>

          <Link
            href={ROUTES.User.Auth.LOGIN}
            className="px-4 py-2 text-base font-medium bg-primary-300 text-primary hover:text-white relative  rounded-sm 
                       overflow-hidden transition-all duration-300
                       before:content-[''] before:absolute before:top-0 before:left-0
                       before:w-0 before:h-full before:bg-white/30
                       before:transition-all before:duration-300
                       hover:before:w-full"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-full text-white w-64 bg-secondary p-6 transform
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col gap-6 mt-10">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute cursor-pointer top-6 right-6"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <Link
            href="/"
            className="flex items-center justify-between text-lg transition-all duprimaryration-300 group hover:text-"
            onClick={() => setIsOpen(false)}
          >
            <span>About</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-between text-lg transition-all duprimaryration-300 group hover:text-"
            onClick={() => setIsOpen(false)}
          >
            <span>Contact</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
           <Link
            href={ROUTES.User.Auth.LOGIN}
            className="px-4 py-2 text-base font-medium bg-primary-300 text-primary hover:text-white relative  rounded-sm 
                       overflow-hidden transition-all duration-300
                       before:content-[''] before:absolute before:top-0 before:left-0
                       before:w-0 before:h-full before:bg-white/30
                       before:transition-all before:duration-300
                       hover:before:w-full"
          >
            Get Started
          </Link>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-40 "
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </nav>
  );
}
