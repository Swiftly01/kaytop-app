"use client";
import React, { JSX } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  icon: string;
  label: string;
  link: string;
}

const data: MenuItem[] = [
  { icon: "/dashboard.svg", label: "Dashboard", link: "/dashboard/system-admin" },
  { icon: "/clients.svg", label: "Branches", link: "/dashboard/system-admin/branches" },
  { icon: "/credit.svg", label: "Credit Officers", link: "/dashboard/system-admin/credit-officers" },
  { icon: "/customer.svg", label: "Customers", link: "/dashboard/system-admin/customers" },
  { icon: "/loans.svg", label: "Loans", link: "/dashboard/system-admin/loans" },
  { icon: "/report.svg", label: "Reports", link: "/dashboard/system-admin/reports" },
  { icon: "/settings.svg", label: "Settings", link: "/dashboard/system-admin/settings" },
];

export default function Sidebar(): JSX.Element {
  const pathname = usePathname();
  
  return (
    <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            className="drawer-overlay lg:hidden"
          ></label>

          <div className="w-[232px] min-h-full bg-white">
            {/* Active indicator bar */}
            {pathname === "/dashboard/system-admin" && (
              <div className="absolute left-0 w-[2px] h-[44px] bg-[#7F56D9]" style={{ top: "24px" }} />
            )}
            
            <ul className="flex flex-col w-full gap-[47px] px-[35px] pt-6">
              {data.map((item, i) => {
                const isActive = pathname === item.link;
                return (
                  <li key={i}>
                    <Link
                      href={item.link}
                      className={`flex items-center gap-[23px] text-base font-medium leading-[1.24] transition-all duration-200 hover:text-[#7F56D9] ${
                        isActive ? "text-[#7F56D9]" : "text-[#888F9B]"
                      }`}
                    >
                      <div className="flex items-center justify-center w-[18px] h-[18px] flex-shrink-0">
                        <img
                          src={item.icon}
                          alt={item.label}
                          className="w-full h-full object-contain transition-opacity duration-200"
                          style={{ 
                            opacity: isActive ? 1 : 0.6
                          }}
                        />
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
  )
}
