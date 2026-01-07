"use client";
import Table from "@/app/_components/ui/table/DisbursementTable";
import { getCreditOfficerMetrics } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import Metric from "./Metric";

import { useDashboardQuery } from "@/app/dashboard/bm/queries/kpi/useDashboardQuery";
import { useCreditOfficers } from "@/app/dashboard/bm/queries/credits/useCreditOfficers";
import CreditOfficerTable from "./table/CreditOfficerTable";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";

export default function CreditClient() {
  const { isLoading, error, data } = useDashboardQuery();

  const metricData = getCreditOfficerMetrics({ data });

  const {
    isLoading: isLoadingCreditOfficer,
    error: creditOfficerError,
    data: creditOfficerData,
  } = useCreditOfficers();
  const { handlePageChange } = usePageChange();



  return (
    <>
      <DashboardHeader data={data} isLoading={isLoading} />

      <Metric item={metricData} cols={1} isLoading={isLoading} error={error} />

      <div>
        <p className="pb-5 text-md">Credit officers</p>
        <div className="p-10 bg-white">
          <CreditOfficerTable
            error={creditOfficerError}
            isLoading={isLoadingCreditOfficer}
            item={creditOfficerData?.data}
            meta={creditOfficerData?.meta}
            onPageChange={(page) => handlePageChange(page, PaginationKey.credit_officers_page)}
          />
        </div>
      </div>
    </>
  );
}
