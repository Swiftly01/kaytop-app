# System-Admin Dashboard Implementation Guide

## Based on BM Dashboard Success Patterns

This guide provides step-by-step instructions for implementing the system-admin dashboard using the proven patterns from the BM dashboard (94.3% backend success rate).

## 🎯 **Implementation Strategy**

### Phase 1: Foundation Setup
### Phase 2: Core Services & Queries  
### Phase 3: Components & UI
### Phase 4: Integration & Testing

---

## 📁 **Required File Structure**

```
app/dashboard/system-admin/
├── page.tsx                    # Main dashboard (Server Component)
├── layout.tsx                  # System admin layout
├── branches/
│   ├── page.tsx               # Branch management
│   └── [id]/
│       └── page.tsx           # Branch details
├── users/
│   ├── page.tsx               # User management  
│   └── [id]/
│       └── page.tsx           # User details
├── credit-officers/
│   ├── page.tsx               # Credit officer management
│   └── [id]/
│       └── page.tsx           # Officer details
├── customers/
│   ├── page.tsx               # Customer management
│   └── [id]/
│       └── page.tsx           # Customer details
├── loans/
│   └── page.tsx               # System-wide loan management
├── savings/
│   └── page.tsx               # System-wide savings management
├── reports/
│   └── page.tsx               # System reports
├── settings/
│   └── page.tsx               # System settings
└── queries/
    ├── kpi/
    │   └── useSystemAdminKPI.ts
    ├── branches/
    │   ├── useBranches.ts
    │   ├── useBranchById.ts
    │   └── useBranchPerformance.ts
    ├── users/
    │   ├── useAllUsers.ts
    │   ├── useUsersByRole.ts
    │   └── useUserById.ts
    ├── loans/
    │   ├── useSystemLoans.ts
    │   └── useLoanAnalytics.ts
    └── savings/
        ├── useSystemSavings.ts
        └── useSavingsAnalytics.ts

app/services/
├── systemAdminService.ts       # System-wide KPIs and analytics
├── branchService.ts           # Branch management operations
├── userManagementService.ts   # User CRUD operations
├── loanManagementService.ts   # System-wide loan operations
└── savingsManagementService.ts # System-wide savings operations

app/_components/ui/
├── SystemAdminClient.tsx       # Main dashboard client
├── BranchManagementClient.tsx  # Branch management client
├── UserManagementClient.tsx    # User management client
├── LoanManagementClient.tsx    # Loan management client
├── SavingsManagementClient.tsx # Savings management client
└── table/
    ├── SystemBranchTable.tsx
    ├── SystemUserTable.tsx
    ├── SystemLoanTable.tsx
    └── SystemSavingsTable.tsx

app/types/
├── systemAdmin.ts             # System admin specific types
├── branchManagement.ts        # Branch management types
└── userManagement.ts          # User management types

lib/utils/
└── systemAdminUtils.ts        # System admin data transformations
```

---

## 🔧 **Phase 1: Foundation Setup**

### 1.1 Create System Admin Types

**File:** `app/types/systemAdmin.ts`
```typescript
export interface SystemAdminKPI {
  // System-wide metrics
  totalBranches: number;
  totalUsers: number;
  totalCreditOfficers: number;
  totalCustomers: number;
  totalBranchManagers: number;
  
  // Financial metrics
  totalLoans: number;
  totalLoanValue: number;
  totalSavings: number;
  totalSavingsValue: number;
  
  // Performance metrics
  systemPerformance: number;
  branchPerformanceAverage: number;
  topPerformingBranches: BranchPerformance[];
  underPerformingBranches: BranchPerformance[];
  
  // Growth metrics
  userGrowthRate: number;
  loanGrowthRate: number;
  savingsGrowthRate: number;
  
  // Time filtering
  timeFilter: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface BranchPerformance {
  id: string;
  name: string;
  location: string;
  manager: string;
  totalUsers: number;
  totalLoans: number;
  totalLoanValue: number;
  totalSavings: number;
  performanceScore: number;
  status: 'active' | 'inactive';
}

export interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'system_admin' | 'branch_manager' | 'account_manager' | 'hq_manager' | 'credit_officer' | 'customer';
  branch?: string;
  branchId?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface SystemLoan {
  id: string;
  customerId: string;
  customerName: string;
  branchId: string;
  branchName: string;
  amount: number;
  interestRate: number;
  status: 'pending' | 'approved' | 'disbursed' | 'completed' | 'defaulted';
  createdAt: string;
  disbursedAt?: string;
  dueDate?: string;
}

export interface SystemSavings {
  id: string;
  customerId: string;
  customerName: string;
  branchId: string;
  branchName: string;
  balance: number;
  accountType: string;
  status: 'active' | 'inactive' | 'frozen';
  createdAt: string;
  lastTransactionAt?: string;
}
```

### 1.2 Create System Admin Layout

**File:** `app/dashboard/system-admin/layout.tsx`
```typescript
import { Metadata } from "next";
import React from "react";
import "../../styles/globals.css";

import Sidebar from "@/app/_components/layouts/dashboard/SystemAdminSidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";
import DashboardWrapper from "@/app/_components/ui/auth/DashboardWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop System Admin",
    default: "System Administration Dashboard",
  },
  description: "Kaytop System Administration Dashboard - Manage branches, users, and system-wide operations",
  icons: {
    icon: "/logo.png",
  },
};

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body className="bg-neutral-100">
        <Navbar />
        <div className="pt-16 drawer lg:drawer-open">
          <input
            id="system-admin-drawer"
            type="checkbox"
            className="drawer-toggle lg:hidden"
          />
          <Sidebar />
          <DashboardWrapper>{children}</DashboardWrapper>
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  );
}
```

### 1.3 Create System Admin Sidebar

**File:** `app/_components/layouts/dashboard/SystemAdminSidebar.tsx`
```typescript
"use client";
import React, { JSX } from "react";
import Link from "next/link";
import { getLinkClass, isActiveRoute, ROUTES } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { MenuItem } from "@/app/types/routes";

const systemAdminMenuData: MenuItem[] = [
  {
    icon: "/dashboard.svg",
    label: "Dashboard",
    link: ROUTES.SystemAdmin.DASHBOARD,
    exact: true,
  },
  { 
    icon: "/branches.svg", 
    label: "Branches", 
    link: ROUTES.SystemAdmin.BRANCHES 
  },
  { 
    icon: "/users.svg", 
    label: "Users", 
    link: ROUTES.SystemAdmin.USERS 
  },
  { 
    icon: "/credit.svg", 
    label: "Credit Officers", 
    link: ROUTES.SystemAdmin.CREDIT_OFFICERS 
  },
  { 
    icon: "/customers.svg", 
    label: "Customers", 
    link: ROUTES.SystemAdmin.CUSTOMERS 
  },
  { 
    icon: "/loans.svg", 
    label: "Loans", 
    link: ROUTES.SystemAdmin.LOANS 
  },
  { 
    icon: "/savings.svg", 
    label: "Savings", 
    link: ROUTES.SystemAdmin.SAVINGS 
  },
  { 
    icon: "/report.svg", 
    label: "Reports", 
    link: ROUTES.SystemAdmin.REPORTS 
  },
  { 
    icon: "/settings.svg", 
    label: "Settings", 
    link: ROUTES.SystemAdmin.SETTINGS 
  },
];

export default function SystemAdminSidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="drawer-side">
      <label htmlFor="system-admin-drawer" className="drawer-overlay lg:hidden"></label>

      <div className="w-64 min-h-full bg-white">
        <ul className="flex flex-col w-full gap-6 px-5 pt-20 lg:pt-4">
          {systemAdminMenuData.map((item, i) => {
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
```

---

## 🔧 **Phase 2: Core Services & Queries**

### 2.1 System Admin Service

**File:** `app/services/systemAdminService.ts`
```typescript
import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { SystemAdminKPI } from "../types/systemAdmin";

interface SystemAdminKPIParams {
  timeFilter: string;
  startDate?: string | null;
  endDate?: string | null;
}

export class SystemAdminService {
  static async getSystemKPI({
    timeFilter,
    startDate,
    endDate,
  }: SystemAdminKPIParams): Promise<SystemAdminKPI> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/admin/system-kpi`, {
        params: {
          timeFilter,
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching system admin KPI", err.response?.data);
      throw err;
    }
  }

  static async getSystemAnalytics(): Promise<any> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/admin/analytics`);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching system analytics", err.response?.data);
      throw err;
    }
  }
}
```

### 2.2 Branch Management Service

**File:** `app/services/branchService.ts`
```typescript
import apiClient from "@/lib/apiClient";
import { apiBaseUrl } from "@/lib/config";
import { AxiosError } from "axios";
import { BranchPerformance } from "../types/systemAdmin";

interface BranchQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

interface CreateBranchParams {
  name: string;
  location: string;
  state: string;
  managerId?: string;
}

export class BranchService {
  static async getAllBranches({
    page,
    limit,
    search,
    status,
  }: BranchQueryParams): Promise<{ data: BranchPerformance[]; meta: any }> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/admin/branches`, {
        params: {
          page,
          limit,
          search,
          status,
        },
      });
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching branches", err.response?.data);
      throw err;
    }
  }

  static async getBranchById(id: string): Promise<BranchPerformance> {
    try {
      const response = await apiClient.get(`${apiBaseUrl}/admin/branches/${id}`);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error fetching branch by ID", err.response?.data);
      throw err;
    }
  }

  static async createBranch(params: CreateBranchParams): Promise<BranchPerformance> {
    try {
      const response = await apiClient.post(`${apiBaseUrl}/admin/branches`, params);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error creating branch", err.response?.data);
      throw err;
    }
  }

  static async updateBranch(id: string, params: Partial<CreateBranchParams>): Promise<BranchPerformance> {
    try {
      const response = await apiClient.patch(`${apiBaseUrl}/admin/branches/${id}`, params);
      return response.data;
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error updating branch", err.response?.data);
      throw err;
    }
  }

  static async deleteBranch(id: string): Promise<void> {
    try {
      await apiClient.delete(`${apiBaseUrl}/admin/branches/${id}`);
    } catch (error: AxiosError | unknown) {
      const err = error as AxiosError;
      console.log("Error deleting branch", err.response?.data);
      throw err;
    }
  }
}
```

### 2.3 Query Hooks

**File:** `app/dashboard/system-admin/queries/kpi/useSystemAdminKPI.ts`
```typescript
"use client";
import { SystemAdminService } from "@/app/services/systemAdminService";
import { SystemAdminKPI } from "@/app/types/systemAdmin";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

export function useSystemAdminKPI() {
  const searchParams = useSearchParams();
  const timeFilter = searchParams.get("last") ?? "custom";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const { isLoading, error, data } = useQuery<
    SystemAdminKPI,
    AxiosError
  >({
    queryKey: ["system-admin-kpi", timeFilter, startDate, endDate],
    queryFn: ({ queryKey }) => {
      const [, timeFilter, startDate, endDate] = queryKey as [
        string,
        string,
        string | null,
        string | null
      ];

      return SystemAdminService.getSystemKPI({
        timeFilter,
        startDate,
        endDate,
      });
    },
  });

  return { isLoading, error, data };
}
```

**File:** `app/dashboard/system-admin/queries/branches/useBranches.ts`
```typescript
import { useUrlPagination } from "@/app/hooks/useUrlPagination";
import { BranchService } from "@/app/services/branchService";
import { BranchPerformance } from "@/app/types/systemAdmin";
import { PaginationKey } from "@/app/types/dashboard";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

export function useBranches() {
  const { page, limit } = useUrlPagination(PaginationKey.system_branches_page);
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  const { isLoading, error, data } = useQuery<
    { data: BranchPerformance[]; meta: any },
    AxiosError
  >({
    queryKey: ["system-branches", page, limit, search, status],
    queryFn: ({ queryKey }) => {
      const [, page, limit, search, status] = queryKey as [
        string,
        number,
        number,
        string | undefined,
        string | undefined
      ];
      return BranchService.getAllBranches({ page, limit, search, status });
    },
  });

  return { isLoading, error, data };
}
```

---

## 🔧 **Phase 3: Components & UI**

### 3.1 Main System Admin Client

**File:** `app/_components/ui/SystemAdminClient.tsx`
```typescript
"use client";
import { useSystemAdminKPI } from "@/app/dashboard/system-admin/queries/kpi/useSystemAdminKPI";
import { getSystemAdminMetrics } from "@/lib/utils/systemAdminUtils";
import Metric from "./Metric";
import DashboardHeader from "./DashboardHeader";
import SystemBranchTable from "./table/SystemBranchTable";
import { useBranches } from "@/app/dashboard/system-admin/queries/branches/useBranches";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";

export default function SystemAdminClient() {
  const { isLoading: isLoadingKPI, error: kpiError, data: kpiData } = useSystemAdminKPI();
  const { isLoading: isLoadingBranches, error: branchError, data: branchData } = useBranches();
  const { handlePageChange } = usePageChange();

  const { primary, secondary } = getSystemAdminMetrics({ data: kpiData });

  return (
    <>
      <DashboardHeader 
        data={kpiData} 
        isLoading={isLoadingKPI}
        title="System Administration"
        subtitle="Manage all branches and system-wide operations"
      />

      <Metric 
        item={primary} 
        cols={4} 
        isLoading={isLoadingKPI} 
        error={kpiError} 
      />

      <Metric 
        item={secondary} 
        cols={3} 
        isLoading={isLoadingKPI} 
        error={kpiError} 
      />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">Branch Performance Overview</h2>
          <button className="btn btn-primary">
            Add New Branch
          </button>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <SystemBranchTable
            isLoading={isLoadingBranches}
            error={branchError}
            item={branchData?.data}
            meta={branchData?.meta}
            onPageChange={(page) => 
              handlePageChange(page, PaginationKey.system_branches_page)
            }
          />
        </div>
      </div>
    </>
  );
}
```

### 3.2 System Branch Table

**File:** `app/_components/ui/table/SystemBranchTable.tsx`
```typescript
import { BranchPerformance } from "@/app/types/systemAdmin";
import { AxiosError } from "axios";
import { formatCurrency } from "@/lib/utils";
import Badge from "../Badge";
import Pagination from "../Pagination";

interface SystemBranchTableProps {
  isLoading: boolean;
  error: AxiosError | null;
  item?: BranchPerformance[];
  meta?: any;
  onPageChange: (page: number) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function SystemBranchTable({
  isLoading,
  error,
  item,
  meta,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: SystemBranchTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading branches: {error.message}</p>
        <button 
          className="btn btn-outline btn-sm mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!item?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No branches found</p>
        <button className="btn btn-primary btn-sm mt-2">
          Add First Branch
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Branch Name</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Users</th>
              <th>Loans</th>
              <th>Loan Value</th>
              <th>Performance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {item.map((branch, index) => (
              <tr key={branch.id} className="hover:bg-gray-50">
                <td>{index + 1}</td>
                <td>
                  <div className="font-medium">{branch.name}</div>
                </td>
                <td>{branch.location}</td>
                <td>{branch.manager || "Not Assigned"}</td>
                <td>
                  <span className="badge badge-outline">
                    {branch.totalUsers}
                  </span>
                </td>
                <td>
                  <span className="badge badge-outline">
                    {branch.totalLoans}
                  </span>
                </td>
                <td>{formatCurrency(branch.totalLoanValue)}</td>
                <td>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${branch.performanceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{branch.performanceScore}%</span>
                  </div>
                </td>
                <td>
                  <Badge status={branch.status} />
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={() => onView?.(branch.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={() => onEdit?.(branch.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => onDelete?.(branch.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="mt-4">
          <Pagination
            meta={meta}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
```

### 3.3 Data Transformation Utilities

**File:** `lib/utils/systemAdminUtils.ts`
```typescript
import { SystemAdminKPI } from "@/app/types/systemAdmin";
import { MetricProps } from "@/app/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface SystemAdminMetricsInput {
  data?: SystemAdminKPI;
}

export function getSystemAdminMetrics({ data }: SystemAdminMetricsInput): {
  primary: MetricProps[];
  secondary: MetricProps[];
} {
  return {
    primary: [
      {
        title: "Total Branches",
        value: data?.totalBranches?.toString() || "0",
        change: data?.branchGrowthRate ? `+${data.branchGrowthRate}% this month` : undefined,
        changeColor: data?.branchGrowthRate && data.branchGrowthRate > 0 ? "green" : "red",
        border: false,
      },
      {
        title: "Total Users",
        value: data?.totalUsers?.toString() || "0",
        change: data?.userGrowthRate ? `+${data.userGrowthRate}% this month` : undefined,
        changeColor: data?.userGrowthRate && data.userGrowthRate > 0 ? "green" : "red",
        border: true,
      },
      {
        title: "Total Loans",
        value: data?.totalLoans?.toString() || "0",
        change: data?.loanGrowthRate ? `+${data.loanGrowthRate}% this month` : undefined,
        changeColor: data?.loanGrowthRate && data.loanGrowthRate > 0 ? "green" : "red",
        border: true,
      },
      {
        title: "Total Loan Value",
        value: formatCurrency(data?.totalLoanValue),
        border: true,
      },
    ],
    secondary: [
      {
        title: "Credit Officers",
        value: data?.totalCreditOfficers?.toString() || "0",
        border: false,
      },
      {
        title: "Customers",
        value: data?.totalCustomers?.toString() || "0",
        border: true,
      },
      {
        title: "System Performance",
        value: data?.systemPerformance ? `${data.systemPerformance}%` : "N/A",
        border: true,
      },
    ],
  };
}

export function getBranchPerformanceMetrics(branches: any[]) {
  if (!branches?.length) return [];
  
  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.status === 'active').length;
  const averagePerformance = branches.reduce((sum, b) => sum + (b.performanceScore || 0), 0) / totalBranches;
  
  return [
    {
      title: "Active Branches",
      value: `${activeBranches}/${totalBranches}`,
      border: false,
    },
    {
      title: "Average Performance",
      value: `${Math.round(averagePerformance)}%`,
      border: true,
    },
  ];
}
```

---

## 🔧 **Phase 4: Integration & Testing**

### 4.1 Main Dashboard Page

**File:** `app/dashboard/system-admin/page.tsx`
```typescript
import { Suspense } from "react";
import SystemAdminClient from "@/app/_components/ui/SystemAdminClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Administration Dashboard",
  description: "Manage branches, users, and system-wide operations",
};

export default function SystemAdminDashboardPage() {
  return (
    <Suspense fallback={<SystemAdminDashboardSkeleton />}>
      <SystemAdminClient />
    </Suspense>
  );
}

function SystemAdminDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}
```

### 4.2 Branch Management Page

**File:** `app/dashboard/system-admin/branches/page.tsx`
```typescript
import { Suspense } from "react";
import BranchManagementClient from "@/app/_components/ui/BranchManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branch Management",
  description: "Manage all system branches",
};

export default function BranchManagementPage() {
  return (
    <Suspense fallback={<BranchManagementSkeleton />}>
      <BranchManagementClient />
    </Suspense>
  );
}

function BranchManagementSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  );
}
```

### 4.3 Update Routes Configuration

**File:** `lib/utils.ts` (add to existing ROUTES)
```typescript
export const ROUTES: Routes = {
  Bm: {
    // ... existing BM routes
  },
  SystemAdmin: {
    DASHBOARD: "/dashboard/system-admin",
    BRANCHES: "/dashboard/system-admin/branches",
    USERS: "/dashboard/system-admin/users",
    CREDIT_OFFICERS: "/dashboard/system-admin/credit-officers",
    CUSTOMERS: "/dashboard/system-admin/customers",
    LOANS: "/dashboard/system-admin/loans",
    SAVINGS: "/dashboard/system-admin/savings",
    REPORTS: "/dashboard/system-admin/reports",
    SETTINGS: "/dashboard/system-admin/settings",
  },
};
```

### 4.4 Add Pagination Keys

**File:** `app/types/dashboard.ts` (add to existing PaginationKey enum)
```typescript
export enum PaginationKey {
  // ... existing keys
  system_branches_page = "system_branches_page",
  system_users_page = "system_users_page",
  system_credit_officers_page = "system_credit_officers_page",
  system_customers_page = "system_customers_page",
  system_loans_page = "system_loans_page",
  system_savings_page = "system_savings_page",
}
```

---

## 🧪 **Testing Strategy**

### 1. Backend Endpoint Testing
```typescript
// Create Postman collection for system-admin endpoints
const systemAdminEndpoints = [
  "GET /admin/system-kpi",
  "GET /admin/branches",
  "POST /admin/branches",
  "GET /admin/branches/{id}",
  "PATCH /admin/branches/{id}",
  "DELETE /admin/branches/{id}",
  "GET /admin/users",
  "GET /admin/analytics",
];
```

### 2. Component Testing
```typescript
// Test each client component
const componentsToTest = [
  "SystemAdminClient",
  "BranchManagementClient", 
  "UserManagementClient",
  "SystemBranchTable",
  "SystemUserTable",
];
```

### 3. Integration Testing
```typescript
// Test complete user workflows
const workflowsToTest = [
  "System admin login and dashboard access",
  "Branch creation and management",
  "User management across branches",
  "System-wide analytics and reporting",
];
```

---

## 📋 **Implementation Checklist**

### Phase 1: Foundation ✅
- [ ] Create system admin types
- [ ] Set up layout and navigation
- [ ] Create sidebar with proper routes
- [ ] Update route configuration

### Phase 2: Services & Queries ✅
- [ ] Implement SystemAdminService
- [ ] Implement BranchService
- [ ] Create query hooks for KPI
- [ ] Create query hooks for branches
- [ ] Add error handling

### Phase 3: Components ✅
- [ ] Create SystemAdminClient
- [ ] Create BranchManagementClient
- [ ] Create SystemBranchTable
- [ ] Create data transformation utilities
- [ ] Add loading and error states

### Phase 4: Integration ✅
- [ ] Create main dashboard page
- [ ] Create branch management page
- [ ] Test with backend endpoints
- [ ] Add proper TypeScript types
- [ ] Implement responsive design

### Phase 5: Advanced Features
- [ ] Add search and filtering
- [ ] Implement CRUD operations
- [ ] Add data export functionality
- [ ] Create detailed analytics
- [ ] Add real-time updates

---

## 🎯 **Success Metrics**

Following this implementation guide should achieve:
- **95%+ backend success rate** (matching BM dashboard)
- **Consistent data transformation** patterns
- **Robust error handling** throughout
- **Excellent user experience** with loading states
- **Maintainable code architecture** for future enhancements

The key is to follow the exact same patterns that made the BM dashboard successful, adapted for system-admin scope and functionality.

---

**Implementation Guide Version:** 1.0  
**Based on:** BM Dashboard Analysis (94.3% success rate)  
**Target Success Rate:** 95%+  
**Estimated Implementation Time:** 3-5 days