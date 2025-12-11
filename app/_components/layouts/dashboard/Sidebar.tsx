import React, { JSX } from 'react';
import Link from "next/link";
import { ROUTES } from '@/lib/utils';

interface MenuItem {
  icon: string;
  label: string;
  link: string;
}

const data: MenuItem[] = [
  { icon: "/dashboard.svg", label: "Dashboard", link: ROUTES.Bm.DASHBOARD },
  { icon: "/credit.svg", label: "Credit Officers", link: ROUTES.Bm.CREDIT },
  { icon: "/credit.svg", label: "Customers", link: ROUTES.Bm.CUSTOMERS },
  { icon: "/loans.svg", label: "Loans", link: ROUTES.Bm.LOAN },
  { icon: "/report.svg", label: "Reports", link: ROUTES.Bm.REPORT },
  { icon: "/settings.svg", label: "Settings", link: ROUTES.Bm.SETTING },
];

export default function Sidebar(): JSX.Element {
  return (
    <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            className="drawer-overlay lg:hidden"
          ></label>

          <div className="w-64 min-h-full bg-white">
            <ul className="flex flex-col w-full gap-6 px-5 pt-20 lg:pt-4">
              {data.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.link}
                    className="relative flex items-center gap-3 px-3 py-2 overflow-hidden transition-colors duration-300 rounded-md cursor-pointer text-neutral-700 hover:text-white before:absolute before:top-0 before:left-0 before:w-0 before:h-full before:bg-brand-purple/70 before:transition-all before:duration-300 hover:before:w-full"
                  >
                    <span className="shrink-0">
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="w-5 h-5"
                      />
                    </span>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
  )
}
