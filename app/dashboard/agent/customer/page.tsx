"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { CustomerService } from "@/app/services/customerService";
import { usePageChange } from "@/app/hooks/usePageChange";
import { getCustomerMetrics } from "@/lib/utils";
import { useDashboardQuery } from "../../bm/queries/kpi/useDashboardQuery";
import { useBranchCustomer } from "../../bm/queries/customers/useBranchCustomer";
import { CustomerMetric } from "@/app/_components/ui/CustomerMetric";
import { CustomerHeader } from "@/app/_components/ui/CustomerHeader";
import { CustomerTable } from "@/app/_components/ui/CustomerTable";
import { PaginationKey } from "@/app/types/dashboard";



export default function CustomersPage() {
  const { isLoading, error, data } = useDashboardQuery();
  const { data: customer, isLoading: isLoadingCustomer, error: customerError } =
    useBranchCustomer();

  const metricData = getCustomerMetrics({ data });
  const { handlePageChange } = usePageChange();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
     
      <CustomerHeader data={data} isLoading={isLoading} />

      {/* Stats */}
      <CustomerMetric
        item={metricData}
        cols={3}
        isLoading={isLoading}
        error={error}
      />

      

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
          <CustomerTable
          isLoading={isLoadingCustomer}
          error={customerError}
          item={customer?.data}
          meta={customer?.meta}
          onPageChange={(page) =>
            handlePageChange(page, PaginationKey.branch_customer_page)
          }
        />
        
      </div>
    </div>
  );
}


