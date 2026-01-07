"use client";
import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import React from "react";
import DashboardHeader from "./DashboardHeader";
import { getCustomerMetrics } from "@/lib/utils";
import Metric from "./Metric";
import { useBranchCustomer } from "@/app/dashboard/bm/queries/customers/useBranchCustomer";
import BranchCustomerTable from "./table/BranchCustomerTable";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";

export default function CustomerClient() {
  const { isLoading, error, data } = useDashboardQuery();

  const metricData = getCustomerMetrics({ data });

  const {
    isLoading: isLoadingCustomer,
    error: customerError,
    data: customer,
  } = useBranchCustomer();

  const { handlePageChange } = usePageChange();

  return (
    <>
      <DashboardHeader data={data} isLoading={isLoading} />

      <Metric item={metricData} cols={2} isLoading={isLoading} error={error} />

      <div>
        <p className="pb-5 text-md">Customers</p>
        <div className="p-10 bg-white">
          <BranchCustomerTable
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
    </>
  );
}
