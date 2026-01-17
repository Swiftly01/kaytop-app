"use client";
import { MenuItem } from "@/app/types/routes";
import { getLinkClass, isActiveRoute } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JSX } from "react";

interface SidebarProps {
  items: MenuItem[];
}
export default function Sidebar({ items }: SidebarProps): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer-4" className="drawer-overlay lg:hidden"></label>

      <div className="w-64 min-h-full bg-white">
        <ul className="flex flex-col w-full gap-6 px-5 pt-20 lg:pt-4">
          {items.map((item, i) => {
            const isActive = isActiveRoute(pathname, item);

            return (
              <li key={i}>
                <Link
                  href={item.link}
                  className={`relative flex items-center gap-3 px-3 py-2 overflow-hidden transition-colors duration-300 rounded-md cursor-pointer text-neutral-700 hover:text-white before:absolute before:top-0 before:left-0 before:w-0 before:h-full before:bg-brand-purple/70 before:transition-all before:duration-300 hover:before:w-full ${getLinkClass(
                    isActive
                  )}`}
                >
                  <span className="shrink-0">
                    <img src={item.icon} alt={item.label} className="w-5 h-5" />
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
