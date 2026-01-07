"use client";
import { useGetCreditOfficerById } from "@/app/dashboard/bm/queries/credits/useGetCreditOfficerById";
import { useLoanCollectionForCreditOfficer } from "@/app/dashboard/bm/queries/loan/useLoanCollectionForCreditOfficer";
import { useLoanDisbursedByCreditOfficer } from "@/app/dashboard/bm/queries/loan/useLoanDisbursedByCreditOfficer";
import { usePageChange } from "@/app/hooks/usePageChange";
import { PaginationKey } from "@/app/types/dashboard";
import {
  getCreditOfficerIdMetrics,
  getCreditOfficerProfileSummary,
  ROUTES
} from "@/lib/utils";
import BreadCrumb from "./BreadCrumb";
import Metric from "./Metric";
import ProfileSummary from "./ProfileSummary";
import CreditOfficerLoanCollectionTable from "./table/CreditOfficerLoanCollectionTable";
import CreditOfficerLoanDisbursedTable from "./table/CreditOfficerLoanDisbursedTable";

export default function CreditOfficerClient() {
  const {
    isLoading: isLoadingMetric,
    error: metricError,
    data: loanDisbursedData,
  } = useLoanDisbursedByCreditOfficer();
  const { isLoading, error, data } = useGetCreditOfficerById();
  const profileSummary = data ? getCreditOfficerProfileSummary(data.data) : [];

  const metricData = loanDisbursedData
    ? getCreditOfficerIdMetrics(loanDisbursedData?.data.summary)
    : [];

  const {
    isLoading: isLoadingCollection,
    error: collectionError,
    data: loanCollectionData,
  } = useLoanCollectionForCreditOfficer();
  const { handlePageChange } = usePageChange();

  return (
    <>
      <BreadCrumb title="Credit Officer" link={ROUTES.Bm.CREDIT} />

      <ProfileSummary
        item={profileSummary}
        isLoading={isLoading}
        error={error}
      />

      <Metric
        item={metricData}
        isLoading={isLoadingMetric}
        error={metricError}
      />

      <div>
        <div className="my-5 text-gray-500 tabs tabs-border custom-tabs">
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Collections"
            defaultChecked
          />
          <div className="p-10 bg-white tab-content">
            <CreditOfficerLoanCollectionTable
              isLoading={isLoadingCollection}
              error={collectionError}
              item={loanCollectionData?.data.collections}
              meta={loanCollectionData?.meta}
              onPageChange={(page) =>
                handlePageChange(
                  page,
                  PaginationKey.credit_officer_loan_collection_page
                )
              }
            />
          </div>

          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Loans disbursed"
          />
          <div className="p-10 bg-white tab-content">
            <CreditOfficerLoanDisbursedTable
              isLoading={isLoadingMetric}
              error={metricError}
              item={loanDisbursedData?.data.loans}
              meta={loanDisbursedData?.meta}
              onPageChange={(page) =>
                handlePageChange(
                  page,
                  PaginationKey.credit_officer_loan_disbursed_Page
                )
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
