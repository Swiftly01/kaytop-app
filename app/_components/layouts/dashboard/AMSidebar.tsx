'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardIcon } from '@/app/_components/icons/dashboard-icon';
import { BranchesIcon } from '@/app/_components/icons/branches-icon';
import { CreditOfficersIcon } from '@/app/_components/icons/credit-officers-icon';
import { CustomersIcon } from '@/app/_components/icons/customers-icon';
import { LoansIcon } from '@/app/_components/icons/loans-icon';
import { SavingsIcon } from '@/app/_components/icons/savings-icon';
import { ReportIcon } from '@/app/_components/icons/report-icon';
import { SettingsIcon } from '@/app/_components/icons/settings-icon';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; color?: string }>;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    href: '/dashboard/am',
  },
  {
    id: 'branches',
    label: 'Branches',
    icon: BranchesIcon,
    href: '/dashboard/am/branches',
  },
  {
    id: 'credit-officers',
    label: 'Credit Officers',
    icon: CreditOfficersIcon,
    href: '/dashboard/am/credit-officers',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: CustomersIcon,
    href: '/dashboard/am/customers',
  },
  {
    id: 'loans',
    label: 'Loans',
    icon: LoansIcon,
    href: '/dashboard/am/loans',
  },
  {
    id: 'savings',
    label: 'Savings',
    icon: SavingsIcon,
    href: '/dashboard/am/savings',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: ReportIcon,
    href: '/dashboard/am/reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    href: '/dashboard/am/settings',
  },
];

export default function AMSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="drawer-side">
      <label
        htmlFor="my-drawer-4"
        className="drawer-overlay lg:hidden"
      ></label>

      <div className="w-[232px] max-w-[232px] min-w-[232px] min-h-full bg-white">
        {/* Menu Items */}
        <nav className="pt-16 lg:pt-6 pl-[35px]">
          <ul className="flex flex-col gap-[47px]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.id} className="relative">
                  {/* Active indicator - 2px left border */}
                  {active && (
                    <div
                      className="absolute left-[-35px] top-0 w-[2px] h-[44px] bg-[#7F56D9]"
                      aria-hidden="true"
                    />
                  )}

                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 transition-all duration-200
                      ${!active ? 'hover:opacity-70' : ''}
                      focus:outline-none
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      className="shrink-0"
                      color={active ? '#7F56D9' : '#888F9B'}
                    />
                    <span
                      className="font-open-sauce-sans text-[16px] leading-[20px] font-medium"
                      style={{
                        color: active ? '#7F56D9' : '#888F9B',
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}